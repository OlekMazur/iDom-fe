/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2014, 2015, 2016, 2018, 2019 Aleksander Mazur
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

import { IHistoryEntry, ISensorHistoryEntry, IDeviceHistoryEntry } from '../data/History'

/**************************************/

export interface IRange {
	min: number
	max: number
}

export interface IThingInfo {
	place: string
	label: string
	color: string
}

export interface IThingsInfo {
	[id: string]: IThingInfo
}

export interface IThingState {
	place: string
	selected: boolean
	listener?: object
	waiting: boolean
	history: IHistoryEntry[]
	plot: string
}

export interface ISensorState extends IThingState {
	history: ISensorHistoryEntry[]
	range?: IRange
}

export interface IDeviceState extends IThingState {
	history: IDeviceHistoryEntry[]
}

export interface IThingsState {
	[id: string]: IThingState
}

export interface ISensorsState {
	[id: string]: ISensorState
}

export interface IDevicesState {
	[id: string]: IDeviceState
}

export interface IPlaceSelect {
	[place: string]: boolean
}

/**************************************/

export const newThing = (): IThingState => ({
	place: '',
	selected: true,
	waiting: false,
	history: [],
	plot: '',
})

/**************************************/

export function getSensorRange(data: ISensorHistoryEntry[]): IRange {
	let min = NaN
	let max = NaN
	for (const p of data) {
		if (isNaN(min) || min > p.value)
			min = p.value
		if (isNaN(max) || max < p.value)
			max = p.value
	}
	return { min, max }
}

export function getSensorsRange(sensors: ISensorsState, places: IPlaceSelect): IRange {
	let min = NaN
	let max = NaN
	for (const sensor of Object.values(sensors))
		if (sensor.selected && places[sensor.place]) {
			const range = sensor.range
			if (range) {
				if (isNaN(min) || min > range.min)
					min = range.min
				if (isNaN(max) || max < range.max)
					max = range.max
			}
		}
	return { min, max }
}

/**************************************/
