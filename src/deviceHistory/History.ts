/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021 Aleksander Mazur
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

import template from './History.vue.js'
import Vue from 'vue'
import { IPlacesThings, parseGlobalThingID, buildGlobalThingID, IBaseNamedThingsWithAlias } from '../data/Things'
import { findTS } from '../history'
import { orderByNameAsc } from '../sort'
import { storageLoadStr, storageSaveStr } from '../storage'
import { IHistoryEntry, IDeviceHistoryEntry, ThingType } from '../data/History'
import { historyRegisterListener, historyUnregisterListener } from '../data/API'
import TimeRangeSelRow from '../widgets/TimeRangeSelRow'
import TimeRangeSelCol from '../widgets/TimeRangeSelCol'
import DeviceSwitchings from './DeviceSwitchings'
import DeviceCycles from './DeviceCycles'

interface IDevice {
	id: string
	label: string
}

function cmpDevices(a: IDevice, b: IDevice) {
	return orderByNameAsc(a.label, b.label)
}

interface ISensorsByName {
	[name: string]: string
}

interface IPlaceDevices {
	devices: IDevice[]
	sensors: IDevice[]
}

interface IPlacesDevices {
	[place: string]: IPlaceDevices
}

function getPlaceSensors(raw?: IBaseNamedThingsWithAlias): ISensorsByName {
	const sensors: ISensorsByName = {}
	if (raw)
		for (const id in raw) {
			const sensor = raw[id]
			if (!(sensor.name && sensor.alias))
				continue
			sensors[sensor.name] = sensor.alias
		}
	return sensors
}

function getPlaceDevices(raw: IBaseNamedThingsWithAlias, sensors: ISensorsByName): IPlaceDevices {
	const place: IPlaceDevices = {
		devices: [],
		sensors: [],
	}
	for (const id in raw) {
		let array: IDevice[]
		let label = raw[id].alias
		if (label) {
			array = place.devices
		} else {
			const name = raw[id].name
			if (!name)
				continue
			label = sensors && sensors[name]
			if (!label)
				continue
			array = place.sensors
		}
		array.push({ id, label })
	}
	place.devices.sort(cmpDevices)
	place.sensors.sort(cmpDevices)
	return place
}

export default Vue.extend({
	...template,
	components: { TimeRangeSelRow, TimeRangeSelCol, DeviceSwitchings, DeviceCycles },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		return {
			device: storageLoadStr('historyDevice', ''),	// "type/globalID"
			tableType: storageLoadStr('historyTableType', 'cycles'),
			history: [] as IDeviceHistoryEntry[],
			listener: undefined as undefined | object,
			waiting: false,
			posXEnd: 0,
			rangeX: 0,
		}
	},
	computed: {
		placeDevices: function(): IPlacesDevices {
			const result: IPlacesDevices = {}
			for (const place in this.placesThings) {
				const things = this.placesThings[place]
				if (!things
					|| (things.permissions && !things.permissions.history)
					|| !things.devices)
					continue
				result[place] = getPlaceDevices(things.devices, getPlaceSensors(things.sensors))
			}
			return result
		},
		deletableShorterThan: function(): number {
			if (this.device) {
				const parts = this.device.split('/', 2)
				if (parts[0] === 'devices') {
					const parsed = parseGlobalThingID(parts[1])
					const things = this.placesThings[parsed.place]
					if (things && things.permissions && things.permissions.historyWrite) {
						const device = things.devices && things.devices[parsed.id]
						if (device && device.name && device.name.startsWith('ow/'))
							return 60
					}
				}
			}
			return 0
		},
	},
	watch: {
		device: {
			immediate: true,
			handler: function(value: string) {
				this.history = []
				storageSaveStr('historyDevice', value)
				this.refreshHistory()
			},
		},
		tableType: function(value: string) {
			storageSaveStr('historyTableType', value)
		},
		posXEnd: 'refreshHistory',
		rangeX: 'refreshHistory',
	},
	methods: {
		buildGlobalThingID: function(place: string, id: string): string {
			return buildGlobalThingID({ place, id })
		},
		refreshHistory: function(start = true): void {
			//console.log('refreshHistory', start, this.posXEnd, this.rangeX, this.device)
			const listener = this.listener
			if (listener) {
				delete this.listener
				historyUnregisterListener(listener)
			}
			this.waiting = start && !!this.device
			if (start) {
				if (this.history.length) {
					const begin = findTS(this.history, this.posXEnd - this.rangeX)
					const end = findTS(this.history, this.posXEnd)
					if (begin > 0 || end < this.history.length)
						this.history = this.history.slice(begin, end)
				}
				if (this.device) {
					const parts = this.device.split('/', 2)
					const parsed = parseGlobalThingID(parts[1])
					this.listener = historyRegisterListener(
						parsed.place, parts[0] as ThingType, parsed.id,
						this.posXEnd - this.rangeX, this.posXEnd,
						this.historyCB)
				}
			}
		},
		historyCB: function(place: string, type: string, id: string, history: IHistoryEntry[]) {
			//console.log('historyCB', place, type, id, history.length)
			this.waiting = false
			this.history = history as IDeviceHistoryEntry[]
		},
	},
	destroyed: function() {
		this.history = []
		this.refreshHistory(false)
	},
})
