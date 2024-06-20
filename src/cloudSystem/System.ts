/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021, 2022, 2024 Aleksander Mazur
 *
 * iDom-fe is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * iDom-fe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with iDom-fe. If not, see <https://www.gnu.org/licenses/>.
 */

import template from './System.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { IPlacesThings, getPermittedPlaces } from '../data/Things'
import {
	cloudWakeUp, cloudSetParameter, cloudSwitchDevice, cloudRenameThing,
	cloudRequestPOST,
} from '../data/cloud/Operations'
import { getThingsProvider, IOrders } from '../data/cloud/Things'
import { cloudOrderLog, cloudLogsForceSync } from '../data/cloud/Logs'
import { cloudCancelOrderVideo, cloudCancelOrderVideoTN } from '../data/cloud/Videos'
import {
	IUpgradeInfo, TCloudUpgradeQuery,
	cloudUpgradeRegisterListener, cloudUpgradeUnregisterListener,
	cloudFirmwareUpgrade, cloudUpgradeURL,
} from '../data/cloud/Upgrade'
import Timestamp from '../widgets/Timestamp'
import ToggleSwitch from '../widgets/ToggleSwitch'
import OptionalNumber from '../widgets/OptionalNumber'
import CollapseExpand from '../widgets/CollapseExpand'
import ButtonDelete from '../widgets/ButtonDelete'
import Things from './Things'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faFilm } from '@fortawesome/free-solid-svg-icons/faFilm'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons/faCloudUploadAlt'
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
import { faFileImage } from '@fortawesome/free-solid-svg-icons/faFileImage'
import { faFileVideo } from '@fortawesome/free-solid-svg-icons/faFileVideo'
import { faFileUpload } from '@fortawesome/free-solid-svg-icons/faFileUpload'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons/faFileAlt'
import { faPlug } from '@fortawesome/free-solid-svg-icons/faPlug'
import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret'
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload'
import { faRepeat } from '@fortawesome/free-solid-svg-icons/faRepeat'
import './System.css'

interface ITimestampByPlace {
	[place: string]: number
}

interface IOrdersByPlace {
	[place: string]: IOrders | undefined
}

interface IUpgradeQueryOfPlace {
	[place: string]: TCloudUpgradeQuery
}

interface IUpgradeInfoByPlace {
	[place: string]: IUpgradeInfo
}

interface IParamsInfo {
	[cgi: string]: Array<{
		args: string
		label: string
		icon: IconDefinition
	}>
}

const paramsPOST: IParamsInfo = {
	'reboot': [{
		icon: faRepeat,
		label: 'Restartuj do nowej wersji',
		args: 'to=upgrade',
	}],
}

export default Vue.extend({
	...template,
	components: { Timestamp, ToggleSwitch, OptionalNumber, CollapseExpand, ButtonDelete, Things },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		const orders: IOrdersByPlace = {}
		const upgradeQueries: IUpgradeQueryOfPlace = {}
		const upgrades: IUpgradeInfoByPlace = {}

		return {
			working: false,
			showThings: false,
			registered: false,
			orders,
			upgradeQueries,
			upgrades,

			upgradeURL: cloudUpgradeURL,
			paramsPOST,

			cloudWakeUp,
			cloudSetParameter,
			cloudOrderLog,
			cloudCancelOrderVideo,
			cloudCancelOrderVideoTN,
			cloudSwitchDevice,
			cloudLogsForceSync,
			cloudRenameThing,

			faQuestion,
			faClock,
			faBell,
			faEnvelope,
			faFilm,
			faCog,
			faCloudUploadAlt,
			faDownload,
			faFileImage,
			faFileVideo,
			faFileUpload,
			faFileAlt,
			faPlug,
			faInfo,
			faUserSecret,
			faUpload,
		}
	},
	computed: {
		places: function(): string[] {
			return Object.keys(this.placesThings).sort()
		},
		upgradablePlaces: function(): string[] {
			return getPermittedPlaces(this.placesThings, 'upgrade')
		},
		permittedPOST: function(): string[] {
			const result: { [permission: string]: boolean } = {}
			if (this.placesThings)
				for (const place of this.places) {
					const permissions = this.placesThings[place]?.permissions?.post
					if (permissions)
						for (const permission of Object.keys(permissions))
							result[permission] = true
				}
			return Object.keys(result).sort()
		},
		timestamp: function(): ITimestampByPlace {
			const timestamp: ITimestampByPlace = {}
			if (this.placesThings)
				for (const place of this.places) {
					const things = this.placesThings[place]
					if (things && typeof things.tsSV === 'number')
						timestamp[place] = things.tsSV / 1000
				}
			return timestamp
		},
		nextTS: function(): ITimestampByPlace {
			const nextTS: ITimestampByPlace = {}
			if (this.placesThings)
				for (const place of this.places) {
					const last = this.timestamp[place]
					if (typeof last === 'number') {
						const things = this.placesThings[place]
						if (things && typeof things.next === 'number')
							nextTS[place] = last + things.next
					}
				}
			return nextTS
		},
	},
	watch: {
		places: {
			immediate: true,
			handler: function() {
				if (!this.registered && this.places !== undefined && this.places.length) {
					getThingsProvider().addOrdersListener(this)
					this.registered = true
				}
			},
		},
		upgradablePlaces: {
			immediate: true,
			handler: function() {
				for (const place of Object.keys(this.upgradeQueries))
					if (!this.upgradablePlaces.includes(place)) {
						cloudUpgradeUnregisterListener(this.upgradeQueries[place])
						delete this.upgradeQueries[place]
					}
				for (const place of this.upgradablePlaces)
					if (!this.upgradeQueries[place])
						this.upgradeQueries[place] = cloudUpgradeRegisterListener(place, this.upgradeChanged)
			},
		},
	},
	methods: {
		ordersChanged: function(place: string, orders?: IOrders): void {
			this.$set(this.orders, place, orders ? Object.assign({}, {
				global: Object.assign({}, orders.global),
				log: Object.assign({}, orders.log),
				video: Object.assign({}, orders.video),
			}) : undefined)
		},
		upgradeChanged: function(place: string, upgrade: IUpgradeInfo): void {
			//console.log('upgradeChanged', place, upgrade)
			this.$set(this.upgrades, place, upgrade)
		},
		cloudRequestPOST: function(place: string, cgi: string, value?: string): void {
			const alias = this.placesThings[place]?.alias
			let info = value ? ` z parametrem "${value}"` : ''
			if (alias)
				info += ` do ${alias}`
			if (value === undefined || confirm(`Czy na pewno wysłać żądanie "${cgi}"${info}?`)) {
				this.working = true
				cloudRequestPOST(place, cgi, value)
				.then(() => {
					this.working = false
				})
			}
		},
		cloudFirmwareUpgrade: function(place: string, url?: string): void {
			const alias = this.placesThings[place]?.alias
			const info = alias ? ` w ${alias}` : ''
			if (!url || confirm(`Czy na pewno rozpocząć aktualizację${info} przy pomocy ${url}?`)) {
				this.working = true
				cloudFirmwareUpgrade(place, url)
				.then(() => {
					this.working = false
				})
			}
		},
	},
	destroyed: function() {
		for (const place of Object.keys(this.upgradeQueries)) {
			cloudUpgradeUnregisterListener(this.upgradeQueries[place])
			delete this.upgradeQueries[place]
		}
		if (this.registered)
			getThingsProvider().removeOrdersListener(this)
	},
})
