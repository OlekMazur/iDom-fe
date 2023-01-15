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

import { IHistoryEntry, IDeviceHistoryEntry } from './data/History'

/**************************************/

export function findTS(data: IHistoryEntry[], ts: number): number {
	let len = data.length
	if (!len)
		return -1
	let div = 0
	while (len) {
		const lenL = len >> 1
		const half = div + lenL
		const lenR = len - lenL
		const val = data[half].ts
		if (ts === val) {
			return half
		} else if (ts < val) {
			len = lenL
		} else {
			div = half + 1
			len = lenR - 1
		}
	}
	return div
}

/**************************************/

export interface IDeviceCycleSummary {
	on: number
	off: number
	total: number
}

export interface IDeviceCycle extends Partial<IDeviceCycleSummary> {
	ts: number
}

export function deviceHistoryToCycles(data: IDeviceHistoryEntry[]): IDeviceCycle[] {
	const result: IDeviceCycle[] = []
	let tsOn: number | undefined
	let tsOff: number | undefined
	let state = false
	const len = data.length
	for (let i = 0; i < len; i++) {
		const p = data[i]
		if (p.value === state)
			continue
		if (p.value) {// on
			if (tsOn !== undefined && tsOff !== undefined) {
				result.push({
					ts: tsOn,
					on: tsOff - tsOn,
					off: p.ts - tsOff,
					total: p.ts - tsOn,
				})
			}
			tsOn = p.ts
			tsOff = undefined
		} else {// off
			tsOff = p.ts
		}
		state = p.value
	}
	if (tsOn) {
		const incomplete: IDeviceCycle = { ts: tsOn }
		if (tsOff)
			incomplete.on = tsOff - tsOn
		result.push(incomplete)
	}
	return result
}

export function deviceCyclesSummary(cycles: IDeviceCycle[]): IDeviceCycleSummary | undefined {
	const result: IDeviceCycleSummary = {
		on: 0,
		off: 0,
		total: 0,
	}
	const len = cycles.length
	let ok = false
	for (let i = 0; i < len; i++) {
		const p = cycles[i]
		if (p.on !== undefined && p.off !== undefined && p.total !== undefined) {
			result.on += p.on
			result.off += p.off
			result.total += p.total
			ok = true
		}
	}
	return ok ? result : undefined
}

/**************************************/
