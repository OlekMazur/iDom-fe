/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021, 2022 Aleksander Mazur
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

import { DataSnapshot, Query,
	query, ref, onValue, child, set, off,
	orderByKey, startAt, endAt, limitToLast,
} from 'firebase/database'
import { TVideosListener } from '../API'
import { IVideo } from '../Video'
import { formatNumberLeadingZeros } from '../../format'
import { strToInt } from '../../utils'
import cloud, { cloudStorageURLPrefix, cloudStorageBucket, dvrRoot, database } from './Setup'

/*------------------------------------*/

function cloudGetSnapVideos(snap: DataSnapshot | null): IVideo[] {
	const result: IVideo[] = []
	if (snap)
		snap.forEach((iter: DataSnapshot | null) => {
			if (!iter || !iter.key)
				return
			const video = iter.val()
			if (!video
				|| typeof video !== 'object'
				|| typeof video.ext !== 'string'
				|| typeof video.size !== 'number'
				|| typeof video.ts !== 'number'
				|| (video.cam && typeof video.cam !== 'string'))
				throw new Error('Nieprawidłowe dane nagrania')
			video.no = strToInt(iter.key)
			result.push(video)
		})
	//console.log('cloudVideos', result.length)
	return result
}

/*------------------------------------*/

export function cloudVideosRegisterListener(place: string, min: number, max: number, listener: TVideosListener) {
	//console.log('cloudVideosRegisterListener', place, min, max)
	const q = query(ref(database, 'things/' + place + '/video'),
		orderByKey(),
		startAt(formatNumberLeadingZeros(min, 8)),
		endAt(formatNumberLeadingZeros(max, 8)),
	)
	onValue(q, (snap: DataSnapshot | null) => {
		listener(place, cloudGetSnapVideos(snap))
	}, (e) => console.error(e))
	return q
}

export function cloudVideosUnregisterListener(q: Query) {
	off(q, 'value')
}

/*------------------------------------*/

export function cloudNewestVideosRegisterListener(place: string, limit: number, listener: TVideosListener) {
	//console.log('cloudNewestVideosRegisterListener', place, limit)
	const q = query(ref(database, 'things/' + place + '/video'),
		orderByKey(),
		limitToLast(limit),
	)
	onValue(q, (snap: DataSnapshot | null) => {
		listener(place, cloudGetSnapVideos(snap))
	}, (e) => console.error(e))
	return q
}

export function cloudNewestVideosUnregisterListener(q: Query) {
	off(q, 'value')
}

/*------------------------------------*/

export function getCloudVideoTNURL(place: string, no: number, frame: number): string {
	const tn = place + '/' + formatNumberLeadingZeros(no, 8) + '/' + formatNumberLeadingZeros(frame, 8)
	return cloudStorageURLPrefix + cloudStorageBucket + '/' + dvrRoot + '/' + tn + '.jpg'
}

/*------------------------------------*/

export function cloudOrderVideo(place: string, no: number, order: boolean): Promise<void> {
	const value = order ? cloud.getUID() : null
	console.log('cloudOrderVideo', place, no, order, value)
	const base = ref(database, 'things/' + place)
	return set(child(base, 'video/' + formatNumberLeadingZeros(no, 8) + '/order'), value)
	.then(() => {
		if (value)
			return set(child(base, 'now/request/order'), true)
	})
}

export function cloudOrderVideoTNUpTo(place: string, no: number, wantTN?: number): Promise<void> {
	console.log('cloudOrderVideoTNUpTo', place, no, wantTN)
	const base = ref(database, 'things/' + place)
	return set(child(base, 'video/' + formatNumberLeadingZeros(no, 8) + '/wantTN'), wantTN === undefined ? null : wantTN)
	.then(() => {
		if (wantTN !== undefined)
			return set(child(base, 'now/request/wantTN'), true)
	})
}

/*------------------------------------*/
