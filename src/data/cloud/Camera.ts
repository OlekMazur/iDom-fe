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

import { cloudDownloadFile } from './Client'
import { ICameraConfig, DefaultCameraConfig } from '../Camera'

export function CloudQueryCameraConfig(place: string, id: string, cksum: string): Promise<ICameraConfig> {
	return cloudDownloadFile(place, 'camera.' + id + '.conf', cksum)
	.then((response) => response.json())
	.then((config) => {
		for (const param in DefaultCameraConfig)
			if (!config[param])
				config[param] = DefaultCameraConfig[param]
			else if (typeof config[param] !== 'number')
				throw new Error('Nieprawidłowa konfiguracja')
		return config
	})
}

export function CloudQueryCameraMask(place: string, id: string, cksum: string): Promise<ArrayBuffer> {
	return cloudDownloadFile(place, 'camera.' + id + '.pbm', cksum)
	.then((response) => response.arrayBuffer())
}
