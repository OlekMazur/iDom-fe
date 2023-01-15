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

import { PIXEL_MIN, PIXEL_MAX } from '../config'

export function DrawImageOnCanvas(canvas: HTMLCanvasElement | undefined, img: HTMLImageElement, boost: boolean) {
	if (!canvas)
		return false
	const ctx = canvas.getContext('2d')
	if (!ctx)
		return false

	const w = canvas.width = img.width
	const h = canvas.height = img.height
	ctx.drawImage(img, 0, 0)

	if (boost) {
		const data = ctx.getImageData(0, 0, w, h)
		const pixel = data.data
		const size = data.width * data.height * 4	// RGBA
		const min = [255, 255, 255]
		const max = [0, 0, 0]

		for (let i = 0, j = 0; i < size; i++, j++) {
			if (j >= 3) {
				j = -1
			} else {
				const v = pixel[i]
				if (min[j] > v)
					min[j] = v
				if (max[j] < v)
					max[j] = v
			}
		}

		const mul = max.map((m, i) => m === min[i] ? 1 : (PIXEL_MAX - PIXEL_MIN) / (m - min[i]))

		for (let i = 0, j = 0; i < size; i++, j++) {
			if (j >= 3) {
				j = -1
			} else {
				pixel[i] = (pixel[i] - min[j]) * mul[j] + PIXEL_MIN
			}
		}

		ctx.putImageData(data, 0, 0)
	}

	return true
}
