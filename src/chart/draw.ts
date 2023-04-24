/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2014, 2015, 2016, 2018, 2019, 2023 Aleksander Mazur
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

import { ISensorHistoryEntry, IDeviceHistoryEntry } from '../data/History'
import { deviceHistoryToCycles } from '../history'

/**************************************/

export interface ISize {
	width: number
	height: number
}

export interface IScaleInfo {
	scaleX: number
	scaleY: number
	x2: number
	y2: number
}

/**************************************/

export const CHART_OFFSET_X = 50
export const CHART_OFFSET_BOTTOM = 100

/**************************************/

export function drawSensor(
	data: ISensorHistoryEntry[],
	scale: IScaleInfo,
	posXEnd: number,
	posYLow: number): string {

	let result = ''
	for (let i = 0, len = data.length; i < len; i++) {
		const p = data[i]
		const x = scale.x2 + (p.ts - posXEnd) * scale.scaleX
		const y = scale.y2 - (p.value - posYLow) * scale.scaleY
		result += (i ? ' L' : 'M') + x + ' ' + y
	}
	return result
}

/**************************************/

export function drawDeviceRaw(
	data: IDeviceHistoryEntry[],
	scale: IScaleInfo,
	posXEnd: number): string {

	let result = ''

	function turnOn(x: number): void {
		result += ' M' + x + ' ' + scale.y2 + ' V0'
	}

	function turnOff(x: number): void {
		result += ' H' + x + ' V' + scale.y2 + ' Z'
	}

	const len = data.length
	let last: boolean | undefined
	if (len) {
		const entry = data[0]
		if (entry.value) {
			last = false
		} else {
			turnOn(CHART_OFFSET_X)
			last = true
		}
	}
	for (let i = 0; i < len; i++) {
		const entry = data[i]
		const x1 = scale.x2 + (entry.ts - posXEnd) * scale.scaleX
		if (entry.value === last)
			continue
		(last ? turnOff : turnOn)(x1)
		last = !last
	}
	if (last)
		turnOff(scale.x2)
	return result
}

export function drawDeviceCycles(
	data: IDeviceHistoryEntry[],
	scale: IScaleInfo,
	posXEnd: number): string {

	let result = ''
	const cycles = deviceHistoryToCycles(data)
	const len = cycles.length
	for (let i = 0; i < len; i++) {
		const cycle = cycles[i]
		if (cycle.on !== undefined && cycle.off !== undefined && cycle.total !== undefined) {
			if (!result.length) {
				const x1 = scale.x2 + (cycle.ts - posXEnd) * scale.scaleX
				result += 'M' + x1 + ' ' + scale.y2
			}
			const x2 = scale.x2 + (cycle.ts + cycle.total - posXEnd) * scale.scaleX
			const rate = cycle.total ? cycle.off / cycle.total : 1
			const y = scale.y2 * rate
			result += ' V' + y + ' H' + x2
		}
	}
	if (result.length)
		result += ' V' + scale.y2 + ' Z'
	return result
}

/**************************************/
