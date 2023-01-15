/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2020, 2021 Aleksander Mazur
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
import { IPlacesThings, IThingsGroup, TIconGetter,
	groupThingsByName, getPermittedPlaces,
} from '../data/Things'
import { ErrorMessage, historyDeleteEntriesOlderThan } from '../data/API'
import { ThingType } from '../data/History'
import { getSensorIcon } from '../style'
import TimeRangeSelRow from '../widgets/TimeRangeSelRow'
import ThingInfo from './ThingInfo'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'

interface IPartiallyDone {
	[globalID: string]: boolean
}

export default Vue.extend({
	...template,
	components: { TimeRangeSelRow, ThingInfo },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		const dt = new Date()
		dt.setMilliseconds(0)
		dt.setSeconds(0)
		dt.setMinutes(0)
		dt.setHours(0)
		dt.setDate(1)
		dt.setMonth(0)
		const posXEndInit = dt.getTime() / 1000

		return {
			posXEndInit,
			posXEnd: posXEndInit,
			rangeX: 24 * 60 * 60,
			working: false,
			partiallyDone: undefined as undefined | IPartiallyDone,

			faQuestion,
			faTimes,
			faSpinner,
		}
	},
	computed: {
		places: function(): string[] {
			//return Object.keys(this.placesThings).sort()
			return getPermittedPlaces(this.placesThings, 'historyWrite').sort()
		},
		/*
		devices: function(): IThingsGroup[] {
			return groupThingsByName(this.placesThings, this.places, 'devices', getDeviceIcon as TIconGetter)
		},
		*/
		sensors: function(): IThingsGroup[] {
			return groupThingsByName(this.placesThings, this.places, 'sensors', getSensorIcon as TIconGetter)
		},
		/*
		neighbours: function(): IThingsGroup[] {
			return groupThingsByName(this.placesThings, this.places, 'neighbours', getNeighbourIcon as TIconGetter)
		},
		*/
	},
	methods: {
		cleanupHistory(place: string, type: ThingType, id: string): Promise<void> {
			return historyDeleteEntriesOlderThan(place, type, id, this.posXEnd)
			.then((retry: boolean) => this.cleanupGroupCB(retry, place, type, id))
		},
		cleanupGroupCB(retry: boolean, place: string, type: ThingType, id: string): Promise<void> | void {
			console.log('deleted history', place, type, id, 'until', this.posXEnd, 'retry', retry)
			if (retry)
				return this.cleanupHistory(place, type, id)
			else if (this.partiallyDone)
				this.$set(this.partiallyDone, type + '.' + place + '.' + id, true)
		},
		cleanupGroup(promises: Promise<void>[], type: ThingType, groups: IThingsGroup[]): void {
			for (const group of groups)
				for (const place in group.idAt)
					if (group.idAt[place])
						promises.push(this.cleanupHistory(place, type, group.idAt[place]))
		},
		cleanup: function(): void {
			if (confirm('Czy na pewno skasować masowo wpisy z historii czujników sprzed ' + this.posXEnd + '?')) {
				this.partiallyDone = {}
				this.working = true
				const promises: Promise<void>[] = []
				//this.cleanupGroup(promises, 'devices', this.devices)
				this.cleanupGroup(promises, 'sensors', this.sensors)
				//this.cleanupGroup(promises, 'neighbours', this.neighbours)
				Promise.all(promises)
				.catch((e) => {
					this.$alert(ErrorMessage(e))
				}).then(() => {
					this.working = false
				})
			}
		},
	},
})
