/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021, 2024 Aleksander Mazur
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

import template from './Things.vue.js'
import Vue from 'vue'
import { IPlacesThings, IThingsGroup, IBaseThing,
	TThingsFilter, TIconGetter, TThingType,
	groupThingsByName,
	isSensorTermostat, isSensorNotTermostat,
	isDeviceTermostat, isDeviceOther,
	getPermittedPlaces,
} from '../data/Things'
import { wakeup } from '../data/API'
import { getDeviceIcon, getSensorIcon, getVariableIcon } from '../style'
import Timestamp from '../widgets/Timestamp'
import SensorDeviceForm from './SensorDeviceForm'
import SensorCell from './SensorCell'
import DeviceCell from './DeviceCell'
import VariableCell from './VariableCell'
import VariableHeader from './VariableHeader'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'

interface ITimestampAtPlace {
	ts?: number
	tsSV?: number
	next?: number
}

interface ITimestampByPlace {
	[place: string]: ITimestampAtPlace
}

export default Vue.extend({
	...template,
	components: { Timestamp, SensorDeviceForm, SensorCell, DeviceCell, VariableCell, VariableHeader },
	props: {
		placesThings: Object as () => IPlacesThings,
		termostat: Boolean as () => boolean,
	},
	data: function() {
		const timestamp: ITimestampByPlace = {}

		return {
			timestamp,
			timerID: undefined as undefined | number,
			refreshTimestamp: {},
			now: 0,

			wakeup,

			faQuestion,
			faClock,
			faBell,
			faExclamationTriangle,
		}
	},
	computed: {
		places: function(): string[] {
			//return Object.keys(this.placesThings).sort()
			return getPermittedPlaces(this.placesThings, 'things').sort()
		},
		devicesFilter: function(): TThingsFilter {
			return (this.termostat ? isDeviceTermostat : isDeviceOther) as TThingsFilter
		},
		devices: function(): IThingsGroup[] {
			return groupThingsByName(this.placesThings, this.places, 'devices',
				getDeviceIcon as TIconGetter, 'sensors', this.devicesFilter)
		},
		sensorsFilter: function(): TThingsFilter {
			return (this.termostat ? isSensorTermostat : isSensorNotTermostat) as TThingsFilter
		},
		sensors: function(): IThingsGroup[] {
			return groupThingsByName(this.placesThings, this.places, 'sensors',
				getSensorIcon as TIconGetter, 'devices', this.sensorsFilter)
		},
		variables: function(): IThingsGroup[] {
			return this.termostat ? [] : groupThingsByName(this.placesThings,
				this.places, 'variables', getVariableIcon as TIconGetter)
		},
		/*
		neighbours: function(): IThingsGroup[] {
			return this.termostat ? [] : groupThingsByName(this.placesThings,
				this.places, 'neighbours', getNeighbourIcon as TIconGetter)
		},
		*/
	},
	watch: {
		placesThings: {
			immediate: true,
			handler: 'scheduleUpdateTimestamp',
		},
		places: {
			immediate: true,
			handler: 'scheduleUpdateTimestamp',
		},
		refreshTimestamp: {
			immediate: true,
			handler: 'updateTimestamp',
		},
	},
	methods: {
		getThing: function(type: TThingType, group: IThingsGroup, place: string): IBaseThing | undefined {
			if (!group.idAt[place])
				return
			const allThings = this.placesThings[place]
			if (!allThings)
				return
			const things = allThings[type]
			if (!things)
				return
			return things[group.idAt[place]]
		},
		scheduleUpdateTimestamp: function() {
			this.refreshTimestamp = {}
		},
		updateTimestamp: function() {
			const timestamp: ITimestampByPlace = {}
			let needTimer = false
			if (this.placesThings)
				for (const place of this.places) {
					const things = this.placesThings[place]
					if (things) {
						const tsAt: ITimestampAtPlace = {}
						if (typeof things.ts === 'number')
							tsAt.ts = things.ts
						if (typeof things.tsSV === 'number')
							tsAt.tsSV = things.tsSV / 1000
						if (typeof things.next === 'number')
							tsAt.next = things.next
						if (tsAt.tsSV !== undefined && tsAt.next !== undefined)
							needTimer = true
						timestamp[place] = tsAt
					}
				}
			//console.log('updateTimestamp', needTimer)
			this.scheduleTimer(needTimer)
			this.timestamp = timestamp
		},
		scheduleTimer: function(need: boolean): void {
			if (need) {
				if (this.timerID === undefined) {
					this.now = (new Date()).getTime() / 1000
					this.timerID = window.setTimeout(this.fireTimer, 6000)
				}
			} else if (this.timerID !== undefined) {
				window.clearTimeout(this.timerID)
				this.timerID = undefined
			}
		},
		fireTimer: function(): void {
			this.timerID = undefined
			this.scheduleTimer(true)
		},
	},
	destroyed: function() {
		this.scheduleTimer(false)
	},
})
