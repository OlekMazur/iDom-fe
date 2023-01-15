/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019 Aleksander Mazur
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

import { ITermosProgramTimeRange } from '../data/Termos'

export function setBit(x: number, index: number, value: boolean): number {
	const mask = 1 << index
	return value ? x | mask : x & ~mask
}

function cmpProgramEntries(a: ITermosProgramTimeRange, b: ITermosProgramTimeRange): number {
	let delta = a.hh - b.hh
	if (!delta)
		delta = a.mm - b.mm
	return delta
}

export function sortProgramEntries(entries: ITermosProgramTimeRange[]): void {
	entries.sort(cmpProgramEntries)
}
