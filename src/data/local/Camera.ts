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

import { strToInt, strToFloat } from '../../utils'
import { QueryGet, CheckResponse } from '../Client'
import { IYUVFrame, ICameraConfig, DefaultCameraConfig } from '../Camera'

export function LocalQueryCameraFrame(id: string): Promise<IYUVFrame> {
	const result: IYUVFrame = {
		dims: [],
	}
	return QueryGet('/cgi-bin/camera', {
		id,
	}).then((response) => {
		CheckResponse(response, 'video/x-raw-yuv')
		for (const dim of ['w', 'h', 'uw', 'uh', 'vw', 'vh']) {
			const header = response.headers.get('X-YUV-' + dim)
			if (!header)
				break
			result.dims.push(strToInt(header))
		}
		if (result.dims.length !== 6)
			throw new Error('Zła odpowiedź serwera')
		const tsHdr = response.headers.get('X-ts')
		if (tsHdr !== null)
			result.ts = strToFloat(tsHdr)
		return response.arrayBuffer()
	}).then((yuv) => ({...result, yuv}))
}

export function LocalQueryCameraConfig(id: string): Promise<ICameraConfig> {
	return QueryGet('/cgi-bin/camera-conf', {
		id,
	}).then((response) => {
		CheckResponse(response, 'application/json')
		return response.json()
	}).then((config) => {
		for (const param in DefaultCameraConfig)
			if (!config[param])
				config[param] = DefaultCameraConfig[param]
			else if (typeof config[param] !== 'number')
				throw new Error('Nieprawidłowa konfiguracja')
		return config
	})
}

export function LocalQueryCameraMask(id: string): Promise<ArrayBuffer> {
	return QueryGet('/cgi-bin/camera-pbm', {
		id,
	}).then((response) => {
		CheckResponse(response, 'image/x-portable-bitmap')
		return response.arrayBuffer()
	})
}
