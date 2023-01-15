/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021, 2022 Aleksander Mazur
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
import { IPlacesThings, getWakeUpSession } from '../data/Things'
import { wakeup } from '../data/API'
import { formatDate, formatTime } from '../format'
import { cloudOrderGeneric, cloudSetMaxTN, cloudSetMaxTNAtOnce, cloudSetRecListSync,
	cloudUpgradeSelect, cloudUpgradeStart, cloudUpgradeStop, cloudSetFileSync,
	cloudSetOauthTN, cloudSetLogListSync, cloudWakeUpReset,
} from '../data/cloud/Operations'
import ToggleSwitch from '../widgets/ToggleSwitch'
import OptionalNumber from '../widgets/OptionalNumber'
import CollapseExpand from '../widgets/CollapseExpand'
import RequestData from './RequestData'
import Things from './Things'
import Token from './Token'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'
import { faBellSlash } from '@fortawesome/free-solid-svg-icons/faBellSlash'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faFilm } from '@fortawesome/free-solid-svg-icons/faFilm'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons/faCloudUploadAlt'
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop'
import { faFileImage } from '@fortawesome/free-solid-svg-icons/faFileImage'
import { faFileVideo } from '@fortawesome/free-solid-svg-icons/faFileVideo'
import { faFileUpload } from '@fortawesome/free-solid-svg-icons/faFileUpload'
import { faSignature } from '@fortawesome/free-solid-svg-icons/faSignature'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons/faFileAlt'

interface IGenericStatus {
	[place: string]: boolean
}

interface IGenerics {
	[generic: string]: IGenericStatus
}

export default Vue.extend({
	...template,
	components: { ToggleSwitch, OptionalNumber, RequestData, CollapseExpand, Things, Token },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		return {
			showThings: false,
			showToken: false,

			faQuestion,
			faClock,
			faBell,
			faBellSlash,
			faEnvelope,
			faFilm,
			faCog,
			faCloudUploadAlt,
			faDownload,
			faPlay,
			faStop,
			faFileImage,
			faFileVideo,
			faFileUpload,
			faSignature,
			faFileAlt,
		}
	},
	computed: {
		places: function(): string[] {
			return Object.keys(this.placesThings).sort()
		},
		generics: function(): IGenerics {
			const result: IGenerics = {}
			for (const place in this.placesThings) {
				const allThings = this.placesThings[place]
				if (!allThings || typeof allThings.permissions !== 'object')
					continue
				const generics = allThings.permissions.generic
				const status = typeof allThings.request === 'object' &&
					typeof allThings.request.generic === 'object'
					? allThings.request.generic : undefined
				for (const generic in generics) {
					if (!generics[generic])
						continue
					if (!result[generic])
						result[generic] = {}
					result[generic][place] = status && !!status[generic] || false
				}
			}
			return result
		},
		rows: function(): string[] {
			return Object.keys(this.generics).sort()
		},
	},
	methods: {
		getWakeUp: function(place: string): string | undefined {
			return getWakeUpSession(this.placesThings[place])
		},
		wakeup: function(place: string): void {
			const session = this.getWakeUp(place)
			if (session)
				wakeup(session)
		},
		formatDate: function(place: string): string {
			const allThings = this.placesThings[place]
			if (!allThings || !allThings.request || typeof allThings.request.ts !== 'number')
				return ''
			return formatDate(new Date(allThings.request.ts))
		},
		formatTime: function(place: string): string {
			const allThings = this.placesThings[place]
			if (!allThings || !allThings.request || typeof allThings.request.ts !== 'number')
				return ''
			return formatTime(new Date(allThings.request.ts))
		},
		orderGeneric: function(place: string, generic: string, want: boolean): void {
			cloudOrderGeneric(place, generic, want)
		},
		setMaxTN: function(place: string, maxTN?: number): void {
			cloudSetMaxTN(place, maxTN)
		},
		setMaxTNAtOnce: function(place: string, maxTNAtOnce: number): void {
			cloudSetMaxTNAtOnce(place, maxTNAtOnce)
		},
		setRecListSync: function(place: string, want: boolean): void {
			cloudSetRecListSync(place, want)
		},
		upgradeSelect: function(place: string, upgrade: string): void {
			cloudUpgradeSelect(place, upgrade)
		},
		upgradeStop: function(place: string): void {
			cloudUpgradeStop(place)
		},
		upgradeStart: function(place: string): void {
			cloudUpgradeStart(place)
		},
		setFileSync: function(place: string, want: boolean): void {
			cloudSetFileSync(place, want)
		},
		setOauthTN: function(place: string, want: boolean): void {
			cloudSetOauthTN(place, want)
		},
		setLogListSync: function(place: string, want: boolean): void {
			cloudSetLogListSync(place, want)
		},
		resetWakeup: function(place: string): void {
			cloudWakeUpReset(place)
		},
	},
})
