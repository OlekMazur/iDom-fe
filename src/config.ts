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

import { storageLoadNumber } from './storage'

export let PIXEL_MIN: number
export let PIXEL_MAX: number
/** How many extra TNs to order at once. */
export let VIDEO_WANT_TN: number
export let TERMOS_TEMP_STEP: number
export let MAX_DELETE_ENTRIES_AT_ONCE: number

function configLoadVar(name: string, defaultValue: number, minValue: number, maxValue: number): number {
	let result = storageLoadNumber(name, defaultValue)
	if (result < minValue)
		result = minValue
	else if (result > maxValue)
		result = maxValue
	return result
}

function configLoad(): void {
	PIXEL_MIN = configLoadVar('videoBoostMin', 0, 0, 255)
	PIXEL_MAX = configLoadVar('videoBoostMax', 255, 0, 255)
	VIDEO_WANT_TN = configLoadVar('videoWantTN', 30, 1, 200)
	TERMOS_TEMP_STEP = configLoadVar('termosTempStep', 0.1, 0.01, 10)
	MAX_DELETE_ENTRIES_AT_ONCE = configLoadVar('maxDeleteEntriesAtOnce', 1440, 1, 10000)
}

configLoad()
