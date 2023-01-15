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

import { ICameraConfig, IYUVFrame } from '../data/Camera'
import { IPBM } from '../data/PBM'
import { PIXEL_MIN, PIXEL_MAX } from '../config'

export interface IFrameDiffPlaneInfo {
	changed: number
	total: number
	threshold: number
}

export interface IFrameDiffInfo {
	maskError: boolean
	plane: IFrameDiffPlaneInfo[]
}

function normalize(array: Uint8Array, start: number, end: number) {
	let i = start
	let min = array[i]
	let max = array[i]
	for (i++; i + 1 < end; i += 2) {
		let smaller = array[i]
		let bigger = array[i + 1]
		if (smaller > bigger) {
			const swap = smaller
			smaller = bigger
			bigger = swap
		}
		if (min > smaller)
			min = smaller
		if (max < bigger)
			max = bigger
	}
	for (; i < end; i++) {
		const single = array[i]
		if (min > single)
			min = single
		if (max < single)
			max = single
	}
	return {
		sub: min,
		mul: max === min ? 1 : (PIXEL_MAX - PIXEL_MIN) / (max - min),
	}
}

// tslint:disable-next-line:cognitive-complexity
export function DrawYUVOnCanvas(
	config: ICameraConfig | undefined,
	curr: IYUVFrame, canvas1: HTMLCanvasElement | undefined,
	boost: boolean,
	mask?: IPBM,
	prev?: IYUVFrame, canvas2?: HTMLCanvasElement): IFrameDiffInfo | undefined {

	if (!curr.yuv)
		return
	if (!canvas1)
		return

	if (prev) {
		if (prev.dims.length !== curr.dims.length) {
			prev = undefined
		} else for (let i = 0; i < curr.dims.length; i++) {
			if (prev.dims[i] !== curr.dims[i]) {
				prev = undefined
				break
			}
		}
	}

	const maskData = mask && mask.w === curr.dims[0] && mask.h === curr.dims[1] ? mask.data : undefined

	if (!config)
		config = {
			'min': 1,
			'min-Y': 1,
			'min-U': 1,
			'min-V': 1,
		}

	const currYUV = new Uint8Array(curr.yuv)
	const prevYUV = prev && prev.yuv ? new Uint8Array(prev.yuv) : undefined

	canvas1.width  = curr.dims[0]
	canvas1.height = curr.dims[1]
	if (canvas2) {
		canvas2.width  = curr.dims[0]
		canvas2.height = curr.dims[1]
	}

	const ctx1 = canvas1.getContext('2d')
	if (!ctx1)
		return
	const ctx2 = canvas2 ? canvas2.getContext('2d') : undefined

	const imageReal = ctx1.createImageData(curr.dims[0], curr.dims[1])
	if (!imageReal)
		return
	const imageDiff = prev && ctx2 ? ctx2.createImageData(curr.dims[0], curr.dims[1]) : undefined

	const dataReal = imageReal.data
	const dataDiff = imageDiff ? imageDiff.data : null
	const max = curr.dims[0] * curr.dims[1]
	let unmaskedPixels = max
	const srcU = max
	const srcV = max + max / (curr.dims[2] * curr.dims[3])
	const uw = curr.dims[0] / curr.dims[2]
	//const vw = curr.dims[0] / curr.dims[4]
	const diffs = [0, 0, 0]
	const color = [0, 0xFF, 0x7F, 0xA0]

	// normalization / contrast stretching
	const normalization = boost ? normalize(currYUV, 0, srcU) : undefined

	for (let src = 0, dst = 0, i = 0, iu = 0, ju = 0, iuSS = 0, juSS = 0, ivSS = 0, jvSS = 0;
		src < max;
		src++, dst += 4) {
		let y = currYUV[src]
		let u = currYUV[srcU + iu + ju] - 128
		let v = currYUV[srcV + iu + ju] - 128

		// normalization / contrast stretching
		const ny = normalization ? (y - normalization.sub) * normalization.mul + PIXEL_MIN : y
		// YUV -> RGB
		dataReal[dst + 0] = ny + v * 1.402 + 0.5
		dataReal[dst + 1] = ny - u * 0.344 - v * 0.714 + 0.5
		dataReal[dst + 2] = ny + u * 1.772 + 0.5
		dataReal[dst + 3] = 0xFF

		const masked = maskData && maskData[src] ? 2 : 0
		if (masked)
			unmaskedPixels--

		if (prevYUV) {
			y -= prevYUV[src]
			u -= prevYUV[srcU + iu + ju] - 128
			v -= prevYUV[srcV + iu + ju] - 128
			const diffV = Math.abs(v) >= config['min-V']
			if (diffV && !masked)
				diffs[2]++
			if (dataDiff)
				dataDiff[dst + 0] = color[masked + (diffV ? 1 : 0)]
			const diffY = Math.abs(y) >= config['min-Y']
			if (diffY && !masked)
				diffs[0]++
			if (dataDiff)
				dataDiff[dst + 1] = color[masked + (diffY ? 1 : 0)]
			const diffU = Math.abs(u) >= config['min-U']
			if (diffU && !masked)
				diffs[1]++
			if (dataDiff)
				dataDiff[dst + 2] = color[masked + (diffU ? 1 : 0)]
		} else if (dataDiff) {
			const col = color[masked]
			dataDiff[dst + 0] = col
			dataDiff[dst + 1] = col
			dataDiff[dst + 2] = col
		}
		if (dataDiff)
			dataDiff[dst + 3] = 0xFF

		if (++i === curr.dims[0]) {
			i = iu = iuSS = ivSS = 0
			if (++juSS === curr.dims[3]) {
				juSS = 0
				ju += uw
			}
			if (++jvSS === curr.dims[5]) {
				jvSS = 0
			}
		} else {
			if (++iuSS === curr.dims[2]) {
				iuSS = 0
				iu++
			}
			if (++ivSS === curr.dims[4]) {
				ivSS = 0
			}
		}
	}

	ctx1.putImageData(imageReal, 0, 0)
	if (ctx2 && imageDiff)
		ctx2.putImageData(imageDiff, 0, 0)

	const result: IFrameDiffInfo = {
		maskError: !!mask && !maskData,
		plane: [],
	}
	for (let plane = 0; plane < diffs.length; plane++) {
		const divisor = plane > 0 ? curr.dims[plane * 2] * curr.dims[plane * 2 + 1] : 1
		const total = Math.floor(unmaskedPixels / divisor)
		const changed = Math.floor(diffs[plane] / divisor)
		const threshold = Math.floor(total / config.min)
		result.plane.push({
			changed,
			total,
			threshold,
		})
	}

	return result
}
