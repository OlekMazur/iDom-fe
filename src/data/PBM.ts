/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018 Aleksander Mazur
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

export interface IPBM {
	w: number
	h: number
	data: boolean[]
}

export function LoadPBM(response: ArrayBuffer): IPBM {
	const pbm = new Uint8Array(response)
	const ws = [32, 10, 9, 13]
	if (pbm[0] !== 0x50 /*P*/ || pbm[1] !== 0x34 /*4*/ || ws.indexOf(pbm[2]) < 0)
		throw new Error('Nieprawidłowy nagłówek PBM')

	const dims = []
	let afterNL = pbm[2] === 10
	let i: number
	for (i = 3; i < pbm.length;) {
		if (afterNL && pbm[i] === 0x23 /*#*/) {
			// skip comment
			for (i++; i < pbm.length && pbm[i] !== 10; i++) {
				// just iterate
			}
			i++
		}
		if (pbm[i] >= 0x30 && pbm[i] <= 0x39) {
			let num = 0
			for (; i < pbm.length && pbm[i] >= 0x30 && pbm[i] <= 0x39; i++)
				num = num * 10 + (pbm[i] - 0x30)
			dims.push(num)
		}
		if (ws.indexOf(pbm[i]) < 0)
			break
		afterNL = pbm[i++] === 10
		if (dims.length === 2)
			break
	}
	if (dims.length !== 2)
		throw new Error('Nie udało się odczytać rozmiaru PBM')

	const size = Math.floor(((dims[0] + 7) & ~7) * dims[1] / 8)
	if (pbm.length !== size + i)
		throw new Error('Rozmiar PBM nie zgadza się z wymiarami podanymi w nagłówku')

	const result: IPBM = {
		w: dims[0],
		h: dims[1],
		data: [],
	}
	let mask = 0x80
	for (let y = 0; y < result.h; y++) {
		for (let x = 0; x < result.w; x++) {
			result.data.push(!!(pbm[i] & mask))
			mask >>= 1
			if (!mask) {
				mask = 0x80
				i++
			}
		}
		if (mask !== 0x80) {
			mask = 0x80
			i++
		}
	}
	if (i !== pbm.length)
		throw new Error('Błąd odczytu PBM')

	return result
}
