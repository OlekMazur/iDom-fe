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

let strcmp = (a: string, b: string): number => {
	if (a < b)
		return -1
	if (a > b)
		return +1
	return 0
}

if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined')
	strcmp = new Intl.Collator().compare

export function orderByNameAsc(a: string | undefined, b: string | undefined): number {
	if (a !== undefined && b !== undefined)
		return strcmp(a, b)
	if (a === undefined && b !== undefined)
		return -1
	if (a !== undefined && b === undefined)
		return 1
	return 0
}

function getUnitOrder(unit?: string): number {
	if (unit === undefined)
		return -2
	return ['V', 'dB', 'dBm', 'Pa', '%', '°C'].indexOf(unit)
}

export function orderByUnitImportance(a?: string, b?: string): number {
	return getUnitOrder(b) - getUnitOrder(a)
}
