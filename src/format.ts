/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021 Aleksander Mazur
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

/**************************************/

export function formatRealNumber(value: number): string {
	const x = value < 10 && value > -10 ? 100 : 10
	return (Math.round(value * x) / x).toString()
}

/**************************************/

export function formatNumberWithUnit(
	value: number | undefined,
	unit = '',
	div = 1000,
	mag = 0) {

	const formatMagnitude = ['', 'k', 'M', 'G', 'T']
	let result = '-'
	if (value !== undefined && !isNaN(value)) {
		while (value >= div && mag < formatMagnitude.length - 1) {
			mag++
			value /= div
		}
		result = formatRealNumber(value)
	}
	return result + (unit ? ' ' : '') + formatMagnitude[mag] + unit
}

/**************************************/

export function formatNumberLeadingZeros(x: number, len: number): string {
	let s = x.toString()
	while (s.length < len)
		s = '0' + s
	return s
}

/**************************************/

export function formatDate(dt: Date): string {
	return formatNumberLeadingZeros(dt.getFullYear(), 4)
		+ '-' + formatNumberLeadingZeros(dt.getMonth() + 1, 2)
		+ '-' + formatNumberLeadingZeros(dt.getDate(), 2)
}

export function formatHHMM(dt: Date): string {
	return formatNumberLeadingZeros(dt.getHours(), 2)
		+ ':' + formatNumberLeadingZeros(dt.getMinutes(), 2)
}

export function formatTime(dt: Date): string {
	let result = formatHHMM(dt)
		+ ':' + formatNumberLeadingZeros(dt.getSeconds(), 2)
	const frac = dt.getMilliseconds()
	if (frac)
		result += '.' + formatNumberLeadingZeros(Math.trunc(frac / 10), 2)
	return result
}

function formatDateTime(dt: Date): string {
	return formatDate(dt) + ' ' + formatTime(dt)
}

export function formatTS(ts: number): string {
	return ts ? formatDateTime(new Date(ts * 1000)) : ''
}

/**************************************/

export function formatElapsedTime(time: number): string {
	const MIN  = 60
	const HOUR = 60 * MIN
	const DAY  = 24 * HOUR
	const elapsedTime = [
		{ div: DAY, suffix: 'd' },
		{ div: HOUR, suffix: 'h' },
		{ div: MIN, suffix: 'm' },
		{ suffix: 's' },
	]
	let result = ''
	if (!isNaN(time)) {
		for (let i = 0, len = elapsedTime.length; i < len; i++) {
			const x = elapsedTime[i].div ? Math.floor(time / (elapsedTime[i].div as number)) : Math.floor(time)
			if (x || (result.length === 0 && i === len - 1)) {
				result += ' ' + x + elapsedTime[i].suffix
				time -= x * (elapsedTime[i].div as number)
			}
		}
		result = result.substring(1)
	}
	return result
}

/**************************************/

export function pluralForm(amount: number, one: string, twoThreeFour: string, zeroFiveMore: string): string {
	if (amount < 0.5 || amount > 4.5)
		return zeroFiveMore
	else if (amount < 1.5)
		return one
	else
		return twoThreeFour
}

/**************************************/
