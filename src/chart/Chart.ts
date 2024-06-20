/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2024 Aleksander Mazur
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

import template from './Chart.vue.js'
import Vue from 'vue'
import ThingsTable from './ThingsTable'
import { getOrderedSensorUnits } from './options'
import {
	IPlaceSelect,
	IThingInfo,
	IThingsInfo,
	IThingState,
	IThingsState,
	IDevicesState,
	ISensorState,
	ISensorsState,
	getSensorRange,
	getSensorsRange,
	newThing,
} from './things'
import { findTS } from '../history'
import {
	ISize, IScaleInfo,
	CHART_OFFSET_X, CHART_OFFSET_BOTTOM,
	drawSensor, drawDeviceRaw, drawDeviceCycles,
} from './draw'
import { IGrid, drawGrid } from './grid'
import { formatRealNumber } from '../format'
import { storageLoadStr, storageSaveStr, storageLoadBool, storageSaveBool } from '../storage'
import { getSensorIcon, getDeviceIcon } from '../style'
import { ISensor, IPlacesThings, IThingsGroup, TThingsFilter, TIconGetter,
	groupThingsByName, getAllThingsIDs, parseGlobalThingID, buildGlobalThingID, getPermittedPlaces,
} from '../data/Things'
import { ThingType, IHistoryEntry, IDeviceHistoryEntry } from '../data/History'
import { historyRegisterListener, historyUnregisterListener } from '../data/API'
import TimeRangeSelRow from '../widgets/TimeRangeSelRow'
import TimeRangeSelCol from '../widgets/TimeRangeSelCol'
import './Chart.css'

const EXT_MARGIN_W = 28
const EXT_MARGIN_H = 80
const DEFAULT_COLOR = '#17252a'

interface IState {
	devices: IDevicesState
	sensors: ISensorsState
}

type TStateKey = keyof IState

const TYPES: TStateKey[] = ['devices', 'sensors']

interface IData extends IState {
	placeSelect: IPlaceSelect

	CHART_OFFSET_X: number
	CHART_OFFSET_BOTTOM: number

	unit: string
	deviceHistory: string

	posXEnd: number
	rangeX: number
	posYLow: number
	rangeY: number
	posYAuto: boolean
	size: ISize
	mouseX: number
	mouseY: number
	bounds?: ClientRect
}

/**
 * Returns an array of IDs of things which are present and selected
 * in "to" but not in "from".
 */
function deltaThingSelect(from: string[], to: string[]): string[] {
	const result: string[] = []
	for (const id of to)
		if (!from.includes(id))
			result.push(id)
	return result
}

interface IDrawDeviceFunctions {
	[option: string]: (data: IDeviceHistoryEntry[], scale: IScaleInfo, posXEnd: number) => string
}

const drawDeviceFunctions: IDrawDeviceFunctions = {
	'1D': drawDeviceRaw,
	'2D': drawDeviceCycles,
}

export default Vue.extend({
	...template,
	components: { ThingsTable, TimeRangeSelRow, TimeRangeSelCol },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function(): IData {
		return {
			CHART_OFFSET_X,
			CHART_OFFSET_BOTTOM,

			unit: storageLoadStr('chartUnit', ''),
			deviceHistory: storageLoadStr('chartDeviceHistory', '2D'),

			posXEnd: 0,
			rangeX: 0,
			posYLow: 0,
			rangeY: 0,
			posYAuto: true,
			size: {
				width: 0,
				height: 0,
			},
			mouseX: -1,
			mouseY: -1,

			devices: {},
			sensors: {},
			placeSelect: {},
		}
	},
	computed: {
		places: function(): string[] {
			//return Object.keys(this.placesThings).sort()
			return getPermittedPlaces(this.placesThings, 'history').sort()
		},
		multiplePlaces: function(): boolean {
			return this.places.length > 1
		},
		devicesOrdered: function(): IThingsGroup[] {
			return groupThingsByName(this.placesThings, this.places, 'devices', getDeviceIcon as TIconGetter, 'sensors')
		},
		allDevices: function(): IThingsInfo {
			const result: IThingsInfo = {}
			for (const globalID of getAllThingsIDs(this.devicesOrdered, true)) {
				const parsed = parseGlobalThingID(globalID)
				const things = this.placesThings[parsed.place]
				if (!things)
					continue
				const device = things.devices[parsed.id]
				if (!device)
					continue
				let label = device.alias || device.name || ''
				if (this.multiplePlaces)
					label += ' @' + things.alias
				result[globalID] = {
					place: parsed.place,
					label,
					color: device.color || DEFAULT_COLOR,
				}
			}
			//console.log('allDevices', result)
			return result
		},
		sensorsOrdered: function(): IThingsGroup[] {
			return this.unit
				? groupThingsByName(this.placesThings, this.places, 'sensors', getSensorIcon as TIconGetter, 'devices',
					this.sensorsFilter as TThingsFilter)
				: []
		},
		allSensors: function(): IThingsInfo {
			const result: IThingsInfo = {}
			for (const globalID of getAllThingsIDs(this.sensorsOrdered, true)) {
				const parsed = parseGlobalThingID(globalID)
				const things = this.placesThings[parsed.place]
				if (!things)
					continue
				const sensor = things.sensors[parsed.id]
				if (!sensor)
					continue
				let label = sensor.alias || sensor.name || ''
				if (this.multiplePlaces)
					label += ' @' + things.alias
				result[globalID] = {
					place: parsed.place,
					label,
					color: sensor.color || DEFAULT_COLOR,
				}
			}
			//console.log('allSensors', result)
			return result
		},
		units: function(): string[] {
			return getOrderedSensorUnits(this.placesThings)
		},
		waiting: function(): boolean {
			for (const state of TYPES)
				for (const id in this[state])
					if (this[state][id].waiting)
						return true
			return false
		},
		scale: function(): IScaleInfo {
			return {
				scaleX: this.rangeX ? (this.size.width - 2 * CHART_OFFSET_X) / this.rangeX : 0,
				scaleY: this.rangeY ? (this.size.height - CHART_OFFSET_BOTTOM) / this.rangeY : 0,
				x2: this.size.width - CHART_OFFSET_X,
				y2: this.size.height - CHART_OFFSET_BOTTOM,
			}
		},
		grid: function(): IGrid {
			//console.log('compute', 'grid')
			return drawGrid(this.size, this.scale, this.posXEnd, this.rangeX, this.posYLow, this.rangeY)
		},
		posYFormatted: function(): string {
			const f1 = this.posYLow || this.rangeY ? formatRealNumber(this.posYLow) : ''
			const f2 = this.rangeY ? formatRealNumber(this.posYLow + this.rangeY) : ''
			return f1 + (f1 && f2 ? '÷' : '') + f2
		},
	},
	watch: {
		places: {
			immediate: true,
			handler: function(curr: string[], prev?: string[]): void {
				const toDel = prev ? deltaThingSelect(curr, prev) : []
				const toAdd = prev ? deltaThingSelect(prev, curr) : curr
				//console.log('places', '---', toDel, '+++', toAdd)
				for (const place of toDel)
					this.$delete(this.placeSelect, place)
				for (const place of toAdd)
					this.$set(this.placeSelect, place,
						storageLoadBool('chart.place.' + place + '.show', true))
			},
		},
		allDevices: {
			immediate: true,
			handler: function(curr: IThingsInfo, prev?: IThingsInfo): void {
				this.updateThingsList('devices', this.devices, curr, Object.keys(curr), prev ? Object.keys(prev) : [])
			},
		},
		allSensors: {
			immediate: true,
			handler: function(curr: IThingsInfo, prev?: IThingsInfo): void {
				this.updateThingsList('sensors', this.sensors, curr, Object.keys(curr), prev ? Object.keys(prev) : [])
			},
		},
		unit: function(value): void {
			storageSaveStr('chartUnit', value)
		},
		deviceHistory: function(value): void {
			this.replotType('devices')
			storageSaveStr('chartDeviceHistory', value)
		},
		scale: 'replot',
		posXEnd: 'refreshThings',
		rangeX: 'refreshThings',
		posYAuto: 'updateRangeY',
	},
	methods: {
		updateThingsList: function(
			type: TStateKey, list: IThingsState,
			info: IThingsInfo, curr: string[], prev: string[]): void {

			const toDel = deltaThingSelect(curr, prev)
			const toAdd = deltaThingSelect(prev, curr)
			//console.log('updateThingsList', type, '---', toDel, '+++', toAdd)
			for (const id of toDel)
				this.thingDel(type, list, id)
			for (const id of toAdd)
				this.thingAdd(type, list, id, info[id])
		},
		replot: function(): void {
			//console.log('replot', JSON.stringify(this.scale))
			for (const type of TYPES)
				this.replotType(type)
		},
		replotType: function(type: TStateKey): void {
			//console.log('replotType', type, JSON.stringify(this.scale))
			const list = this[type]
			for (const id in list) {
				const thing = list[id]
				if (thing.selected && this.placeSelect[thing.place])
					this.thingPlot(type, this[type], id)
			}
		},
		restartThings: function(start: boolean): void {
			//console.log('restartThings', start)
			for (const state of TYPES) {
				const list = this[state]
				for (const id in list) {
					const thing = list[id]
					if (thing.selected && this.placeSelect[thing.place]) {
						this.thingStop(state, list, id)
						if (start)
							this.thingStart(state, list, id)
					}
				}
			}
		},
		refreshThings: function(): void {
			//console.log('refreshThings')
			this.restartThings(true)
			this.replot()
		},
		thingStart: function(type: TStateKey, list: IThingsState, id: string): void {
			//console.log('thingStart', type, id)
			const thing = list[id]
			this.$set(thing, 'waiting', true)
			if (thing.history.length) {
				const begin = findTS(thing.history, this.posXEnd - this.rangeX)
				const end = findTS(thing.history, this.posXEnd)
				if (begin > 0 || end < thing.history.length) {
					this.updateHistory(type, id, thing, thing.history.slice(begin, end))
				}
			}
			const parsed = parseGlobalThingID(id)
			thing.listener = historyRegisterListener(
				parsed.place, type, parsed.id,
				this.posXEnd - this.rangeX, this.posXEnd,
				this.historyCB)
		},
		thingAdd: function(type: TStateKey, list: IThingsState, id: string, info: IThingInfo): void {
			//console.log('thingAdd', type, id, info)
			const thing = newThing()
			thing.place = info.place
			thing.selected = storageLoadBool('chart.' + type + '.' + id + '.show', true)
			this.$set(list, id, thing)
			if (thing.selected && this.placeSelect[thing.place])
				this.thingStart(type, list, id)
		},
		thingStop: function(type: TStateKey, list: IThingsState, id: string): void {
			//console.log('thingStop', type, id)
			const thing = list[id]
			this.$set(thing, 'waiting', false)
			const listener = thing.listener
			if (listener !== undefined) {
				delete thing.listener
				historyUnregisterListener(listener)
			}
		},
		thingDel: function(type: TStateKey, list: IThingsState, id: string): void {
			//console.log('thingDel', type, id)
			const thing = list[id]
			if (thing.selected && this.placeSelect[thing.place])
				this.thingStop(type, list, id)
			this.$delete(list, id)
		},
		thingPlot: function(type: TStateKey, thing: IThingsState, id: string): void {
			//console.log('thingPlot', type, id)
			if (type === 'devices') {
				const device = this.devices[id]
				this.$set(device, 'plot', device.selected && this.placeSelect[device.place]
					? this.drawDevice(device.history)
					: '')
			} else if (type === 'sensors') {
				const sensor = this.sensors[id]
				this.$set(sensor, 'plot', sensor.selected && this.placeSelect[sensor.place]
					? drawSensor(sensor.history, this.scale, this.posXEnd, this.posYLow)
					: '')
			}
		},
		historyCB: function(place: string, type: ThingType, id: string, history: IHistoryEntry[]): void {
			//console.log('historyCB', place, type, id, history.length)
			const key = type as TStateKey
			if (TYPES.indexOf(key) < 0)
				return
			const globalID = buildGlobalThingID({ place, id })
			const list = this[key]
			const thing = list[globalID]
			this.$set(thing, 'waiting', false)
			this.updateHistory(key, globalID, thing, history)
			this.thingPlot(key, list, globalID)
		},
		updateHistory: function(type: TStateKey, id: string, thing: IThingState, history: IHistoryEntry[]): void {
			thing.history = history
			if (type === 'sensors') {
				const sensor = thing as ISensorState
				sensor.range = getSensorRange(sensor.history)
				this.updateRangeY()
			}
		},
		updateRangeY: function(): void {
			if (this.posYAuto) {
				const range = getSensorsRange(this.sensors, this.placeSelect)
				//console.log('updateRangeY', range)
				this.posYLow = range.min
				this.rangeY = range.max - range.min
			}
		},
		selectPlace: function(place: string, checked: boolean): void {
			const old = this.placeSelect[place]
			//console.log('selectPlace', place, checked)
			this.$set(this.placeSelect, place, checked)
			storageSaveBool('chart.place.' + place + '.show', checked)
			for (const type of TYPES) {
				const list = this[type]
				for (const id in list) {
					const thing = list[id]
					if (thing.selected && thing.place === place) {
						if (old && !checked)
							this.thingStop(type, list, id)
						if (!old && checked)
							this.thingStart(type, list, id)
						this.thingPlot(type, list, id)
					}
				}
			}
			this.updateRangeY()
		},
		selectThing: function(type: TStateKey, id: string, checked: boolean): void {
			const list: IThingsState = this[type]
			const thing = list[id]
			const old = thing.selected
			//console.log('selectThing', type, id, old, checked)
			this.$set(thing, 'selected', checked)
			storageSaveBool('chart.' + type + '.' + id + '.show', checked)
			if (this.placeSelect[thing.place]) {
				if (old && !checked)
					this.thingStop(type, list, id)
				if (!old && checked)
					this.thingStart(type, list, id)
				this.thingPlot(type, list, id)
				if (type === 'sensors')
					this.updateRangeY()
			}
		},
		resize: function(): void {
			this.size = {
				width: window.innerWidth - EXT_MARGIN_W,
				height: window.innerHeight - EXT_MARGIN_H,
			}
		},
		sensorsFilter: function(sensor: ISensor): boolean {
			return sensor.unit === this.unit
		},
		mouseMove: function(e: MouseEvent): void {
			if (!this.$refs.svg)
				return
			const rect = (this.$refs.svg as Element).getBoundingClientRect()
			if (!rect)
				return
			this.mouseX = e.clientX - rect.left
			this.mouseY = e.clientY - rect.top
		},
		mouseOut: function(): void {
			this.mouseX = -1
			this.mouseY = -1
		},
		drawDevice: function(history: IDeviceHistoryEntry[]): string {
			const func = drawDeviceFunctions[this.deviceHistory]
			return func ? func(history, this.scale, this.posXEnd) : ''
		},
	},
	created: function(): void {
		window.addEventListener('resize', this.resize)
		this.resize()
	},
	destroyed: function(): void {
		window.removeEventListener('resize', this.resize)
		this.restartThings(false)
	},
})
