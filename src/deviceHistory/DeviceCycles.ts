/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019 Aleksander Mazur
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

import template from './DeviceCycles.vue.js'
import Vue from 'vue'
import { parseGlobalThingID } from '../data/Things'
import { ErrorMessage, historyDeleteEntry } from '../data/API'
import { IDeviceHistoryEntry, ThingType } from '../data/History'
import { deviceHistoryToCycles, deviceCyclesSummary, IDeviceCycle, IDeviceCycleSummary } from '../history'
import { formatElapsedTime, formatNumberWithUnit } from '../format'
import DeviceCycle from './DeviceCycle'

export default Vue.extend({
	...template,
	components: { DeviceCycle },
	props: {
		history: Array as () => IDeviceHistoryEntry[],
		device: String as () => string,	// type/globalID e.g. devices/place.ID
		deletableShorterThan: Number as () => number,
	},
	data: function() {
		return {
			formatElapsedTime,
			formatNumberWithUnit,
		}
	},
	computed: {
		cycles: function(): IDeviceCycle[] {
			return deviceHistoryToCycles(this.history).reverse()
		},
		summary: function(): IDeviceCycleSummary | undefined {
			return deviceCyclesSummary(this.cycles)
		},
	},
	methods: {
		deleteEntries: function(tsOff: number, tsOn: number): void {
			if (confirm('Czy na pewno skasować wpis z historii?')) {
				const parts = this.device.split('/', 2)
				const type = parts[0] as ThingType
				const parsed = parseGlobalThingID(parts[1])
				Promise.all([
					historyDeleteEntry(parsed.place, type, parsed.id, tsOff),
					historyDeleteEntry(parsed.place, type, parsed.id, tsOn),
				]).catch((e) => {
					this.$alert(ErrorMessage(e))
				})
			}
		},
	},
})
