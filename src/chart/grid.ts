/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2014, 2015, 2016, 2018 Aleksander Mazur
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

import { ISize, IScaleInfo, CHART_OFFSET_X, CHART_OFFSET_BOTTOM } from './draw'
import { formatHHMM, formatDate } from '../format'
import { isRoundNumber, isNearZero } from '../utils'

/**************************************/

export interface IGridLabel {
	pos: number
	label: string
	clazz: string
}

export interface IGrid {
	lines: string
	linesBold: string
	labelsV: IGridLabel[]
	labelsH: IGridLabel[]
}

/**************************************/

/** Minimal grid field width or height, in pixels. */
const GRID_MIN_STEP = 12

/**
 * Allowed steps of time ranges (in seconds) covered by single grid field,
 * in ascending order.
 */
const GRID_X_STEPS = [
	// minutes
	60, 2 * 60, 3 * 60, 5 * 60, 10 * 60, 15 * 60, 20 * 60, 30 * 60,
	// hours
	60 * 60, 2 * 60 * 60, 3 * 60 * 60, 4 * 60 * 60, 6 * 60 * 60, 8 * 60 * 60, 12 * 60 * 60,
	// days
	24 * 60 * 60,
]

/**
 * Calculates the step in seconds between vertical grid lines (or points on the time axis).
 *
 * @param pixelsPerSecond Number of pixels available horizontally divided by number
 *                        of seconds covered by selected range of the time axis.
 * @return How wide is a single grid field, in seconds.
 */
function getGridStepX(pixelsPerSecond: number): number {
	const minSeconds = GRID_MIN_STEP / pixelsPerSecond
	let step = 0
	for (; step < GRID_X_STEPS.length; step++)
		if (GRID_X_STEPS[step] >= minSeconds)
			break
	if (step < GRID_X_STEPS.length)
		return GRID_X_STEPS[step]
	// calculate minimal round number of days
	const DAY = GRID_X_STEPS[GRID_X_STEPS.length - 1]
	const result = Math.ceil(minSeconds + DAY)
	return result - result % DAY
}

/**************************************/

/**
 * Parameters used to calculate positions of horizontal grid lines
 * and format their labels.
 */
interface IGridStepY {
	/** Number of fractional digits to be displayed in a label. */
	afterDot: number
	/** Step between grid lines, in units of Y axis values (not in pixels). */
	step: number
}

/**
 * Calculates the step between horizontal grid lines (or points on the Y axis).
 *
 * @param pixels Number of pixels available vertically divided by
 *               size of the range of values displayed on the Y axis.
 * @return How wide is a single grid field, in seconds.
 */
function getGridStepY(scale: number): IGridStepY {
	const minStep = GRID_MIN_STEP / scale
	const result = {
		afterDot: 0,
		step: Math.floor(minStep + 1),
	}
	if (minStep <= 1) {
		result.afterDot = Math.ceil(-Math.log(minStep) / Math.LN10)
		const mul = Math.pow(10, result.afterDot)
		let frac = Math.ceil(minStep * mul)
		if (frac > 5) {
			frac = 10
			result.afterDot--
		} else if (frac > 2) {
			frac = 5
		} else if (frac > 1) {
			frac = 2
		} else {
			frac = 1
		}
		result.step = frac / mul
	}
	return result
}

/**************************************/

function drawGridVertical(
	result: IGrid, gridStepX: number,
	scale: IScaleInfo, posXEnd: number, rangeX: number): void {

	const baseTS = posXEnd - rangeX

	for (let offset = -posXEnd % gridStepX; offset <= rangeX; offset += gridStepX) {
		let line = ''
		if (offset >= 0) {
			const x = CHART_OFFSET_X + offset * scale.scaleX
			line = ' M' + x + ' 0 V' + scale.y2
		}
		const ts = baseTS + offset
		const dt = new Date(ts * 1000)
		let label = ''
		let clazz = ''
		if (dt.getHours() || dt.getMinutes()) {
			label = formatHHMM(dt)
			result.lines += line
		} else {
			label = formatDate(dt)
			clazz = 'bold'
			result.linesBold += line
		}
		result.labelsV.push({
			pos: CHART_OFFSET_X + offset * scale.scaleX,
			label,
			clazz,
		})
	}
}

function drawGridHorizontal(
	result: IGrid, gridStepY: IGridStepY,
	scale: IScaleInfo, posYLow: number, rangeY: number, size: ISize): void {

	for (let offset = -posYLow % gridStepY.step; offset <= rangeY; offset += gridStepY.step) {
		let line = ''
		if (offset >= 0) {
			const y = size.height - CHART_OFFSET_BOTTOM - offset * scale.scaleY
			line = ' M' + CHART_OFFSET_X + ' ' + y + ' H' + scale.x2
		}
		const val = posYLow + offset
		if (isNearZero(val)) {
			result.linesBold += line
		} else {
			result.lines += line
		}
		result.labelsH.push({
			pos: size.height - CHART_OFFSET_BOTTOM - offset * scale.scaleY,
			label: val.toFixed(gridStepY.afterDot),
			clazz: isRoundNumber(val) ? 'bold' : '',
		})
	}
}

export function drawGrid(
	size: ISize,
	scale: IScaleInfo,
	posXEnd: number, rangeX: number,
	posYLow: number, rangeY: number): IGrid {

	const result: IGrid = {
		lines: '',
		linesBold: '',
		labelsV: [],
		labelsH: [],
	}

	// vertical grid & labels
	if (scale.scaleX)
		drawGridVertical(result, getGridStepX(scale.scaleX), scale, posXEnd, rangeX)

	// horizontal grid & labels
	if (scale.scaleY)
		drawGridHorizontal(result, getGridStepY(scale.scaleY), scale, posYLow, rangeY, size)

	// ready
	return result
}

/**************************************/
