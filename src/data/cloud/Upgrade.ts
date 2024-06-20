/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2024 Aleksander Mazur
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

import {
	Unsubscribe, DataSnapshot,
	ref, set, query, onValue,
} from 'firebase/database'
import { cloudStorageURLPrefix, cloudStorageBucket, database } from './Setup'

/*------------------------------------*/

export const cloudUpgradeURL = `${cloudStorageURLPrefix}${cloudStorageBucket}/upgrade/kernel.enc`

/*------------------------------------*/

export interface IUpgradeInfo {
	load: boolean
	url?: string
	path?: string
}

type TUpgradeListener = (place: string, upgrade: IUpgradeInfo) => void

export type TCloudUpgradeQuery = Unsubscribe

export function cloudUpgradeRegisterListener(place: string, listener: TUpgradeListener): TCloudUpgradeQuery {
	return onValue(query(ref(database, 'things/' + place + '/req/upgrade')), (snap: DataSnapshot | null): void => {
		const upgrade: IUpgradeInfo = {
			load: false,
		}
		if (snap) {
			const data = snap.val()
			if (data && typeof data === 'object') {
				if (typeof data.load === 'boolean')
					upgrade.load = data.load
				if (typeof data.url === 'string')
					upgrade.url = data.url
				if (typeof data.path === 'string')
					upgrade.path = data.path
			}
		}
		listener(place, upgrade)
	}, (e) => console.error(e))
}

export function cloudUpgradeUnregisterListener(query: TCloudUpgradeQuery) {
	query()
}

/*------------------------------------*/

export function cloudFirmwareUpgrade(place: string, url?: string): Promise<void> {
	console.log('cloudFirmwareUpgrade', place, url)
	return set(ref(database, `things/${place}/req/upgrade`), url === undefined ? null : {
		url,
		path: '/mnt/boot/',
		load: true,
	})
}
