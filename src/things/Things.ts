/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021 Aleksander Mazur
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
	getWakeUpSession, getPermittedPlaces,
} from '../data/Things'
import { wakeup } from '../data/API'
import { formatDate, formatTime } from '../format'
import { getDeviceIcon, getSensorIcon, getVariableIcon } from '../style'
import SensorDeviceForm from './SensorDeviceForm'
import SensorCell from './SensorCell'
import DeviceCell from './DeviceCell'
import VariableCell from './VariableCell'
import VariableHeader from './VariableHeader'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'

export default Vue.extend({
	...template,
	components: { SensorDeviceForm, SensorCell, DeviceCell, VariableCell, VariableHeader },
	props: {
		placesThings: Object as () => IPlacesThings,
		termostat: Boolean as () => boolean,
	},
	data: function() {
		return {
			faQuestion,
			faClock,
			faBell,
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
		formatDate: function(place: string): string {
			const allThings = this.placesThings[place]
			if (!allThings)
				return ''
			return formatDate(new Date(allThings.ts * 1000))
		},
		formatTime: function(place: string): string {
			const allThings = this.placesThings[place]
			if (!allThings)
				return ''
			return formatTime(new Date(allThings.ts * 1000))
		},
		getWakeUp: function(place: string): string | undefined {
			return getWakeUpSession(this.placesThings[place])
		},
		wakeup: function(place: string): void {
			const session = this.getWakeUp(place)
			if (session)
				wakeup(session)
		},
	},
})
