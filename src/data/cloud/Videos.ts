/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021, 2022, 2024 Aleksander Mazur
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

import { DataSnapshot, Query, Unsubscribe,
	query, ref, onValue, child, set, off,
	orderByKey, startAt, endAt, limitToLast,
} from 'firebase/database'
import { TVideosListener } from '../API'
import { IVideo } from '../Video'
import { formatNumberLeadingZeros } from '../../format'
import { strToInt } from '../../utils'
import { cloudStorageURLPrefix, cloudStorageBucket, dvrRoot, database } from './Setup'
import { getThingsProvider, IOrdersListener, IOrdersVideo, IOrdersGlobalTN, IOrders } from './Things'

/*------------------------------------*/

function decodeWantTN(orderTN?: string): number | undefined {
	if (orderTN) {
		const array = orderTN.split('-', 3).map((part) => parseInt(part, 10)) || []
		if (array.length == 2)
			return array[1]
	}
	return undefined
}

class CloudVideosQuery implements IOrdersListener {
	private unsubscribe: Unsubscribe
	private snapshot: IVideo[] = []
	private orders: IOrdersVideo | undefined
	private ordersTN: IOrdersGlobalTN | undefined

	constructor(private place: string, private listener: TVideosListener, min: number, max: number, limit: number) {
		if ((isNaN(min) != isNaN(max)) || (isNaN(min) && isNaN(limit)) || (!isNaN(min) && (min > max || min < 0 || max < 0)) || (!isNaN(limit) && limit <= 0))
			throw new Error('Nieprawidłowe ograniczenia: ' + min + ' ' + max + ' ' + limit)
		//console.log('CloudVideosQuery', place, limit)
		const constraints = [orderByKey()]
		if (!isNaN(limit)) {
			constraints.push(limitToLast(limit))
		} else {
			constraints.push(startAt(formatNumberLeadingZeros(min, 8)))
			constraints.push(endAt(formatNumberLeadingZeros(max, 8)))
		}
		this.unsubscribe = onValue(query(ref(database, 'things/' + place + '/video'), ...constraints),
			this.snapshotChanged,
			(e) => console.error(e)
		)
		getThingsProvider().addOrdersListener(this, place)
	}

	public readonly destroy = (): void => {
		//console.log('CloudVideosQuery.destroy', this.place)
		getThingsProvider().removeOrdersListener(this, this.place)
		this.unsubscribe()
	}

	private readonly snapshotChanged = (snap: DataSnapshot | null): void => {
		const result: IVideo[] = []
		if (snap)
			snap.forEach((iter: DataSnapshot | null) => {
				if (!iter || !iter.key)
					return
				const elem = iter.val()
				if (!elem
					|| typeof elem !== 'object'
					|| typeof elem.ext !== 'string'
					|| typeof elem.size !== 'number'
					|| typeof elem.ts !== 'number'
					|| (elem.cam && typeof elem.cam !== 'string')) {
					console.error('Nieprawidłowe dane nagrania', iter.key, elem)
					return
				}
				elem.no = strToInt(iter.key)
				const order = this.orders && this.orders[iter.key] && this.orders[iter.key] === elem.ext
				if (order !== undefined)
					elem.order = order
				const tn = decodeWantTN(this.ordersTN && this.ordersTN[iter.key])
				if (tn !== undefined)
					elem.wantTN = tn
				result.push(elem)
			})
		this.snapshot = result
		//console.log('snapshotChanged', this.place, this.snapshot)
		this.notifyListener()
	}

	public readonly ordersChanged = (place: string, orders?: IOrders): void => {
		if (place !== this.place)
			return;
		this.orders = orders?.video
		this.ordersTN = orders?.global?.tn
		//console.log('ordersChanged', this.place, this.orders, this.ts)
		const result = this.snapshot
		if (result) {
			let dirty = 0
			for (let i = 0; i < result.length; i++) {
				const elem = result[i]
				const old = elem.order
				const oldTN = elem.wantTN
				const rec = formatNumberLeadingZeros(elem.no, 8)
				const order = this.orders && typeof this.orders[rec] == 'string' && this.orders[rec] === elem.ext
				if (order !== old) {
					if (order !== undefined)
						elem.order = order
					else
						delete elem.order
				}
				const tn = decodeWantTN(this.ordersTN && this.ordersTN[rec])
				if (tn !== oldTN) {
					if (tn !== undefined)
						elem.wantTN = tn
					else
						delete elem.wantTN
				}
				//console.log('ordersChanged', rec, this.orders && this.orders[rec], this.ordersTN && this.ordersTN[rec], old, order, oldTN, tn)
				if (order !== old || tn !== oldTN) {
					result[i] = Object.assign({}, elem)
					dirty++
				}
			}
			if (dirty) {
				this.snapshot = result.slice(0)
				this.notifyListener()
			}
		}
	}

	private readonly notifyListener = (): void => {
		this.listener(this.place, this.snapshot)
	}
}

/*------------------------------------*/

export function cloudVideosRegisterListener(place: string, min: number, max: number, listener: TVideosListener) {
	return new CloudVideosQuery(place, listener, min, max, NaN)
}

export function cloudVideosUnregisterListener(query: CloudVideosQuery) {
	query.destroy()
}

/*------------------------------------*/

export function cloudNewestVideosRegisterListener(place: string, limit: number, listener: TVideosListener) {
	return new CloudVideosQuery(place, listener, NaN, NaN, limit)
}

export function cloudNewestVideosUnregisterListener(query: CloudVideosQuery) {
	query.destroy()
}

/*------------------------------------*/

export function getCloudVideoTNURL(place: string, no: number, frame: number): string {
	const tn = place + '/' + formatNumberLeadingZeros(no, 8) + '/' + formatNumberLeadingZeros(frame, 8)
	return cloudStorageURLPrefix + cloudStorageBucket + '/' + dvrRoot + '/' + tn + '.jpg'
}

/*------------------------------------*/

export function cloudOrderVideo(place: string, video: IVideo, order: boolean): Promise<void> {
	console.log('cloudOrderVideo', place, video.no + '.' + video.ext, order)
	return set(ref(database, 'things/' + place + '/req/u/' + getThingsProvider().getOrderKey() + '/video/' + formatNumberLeadingZeros(video.no, 8)), order ? video.ext : null)
}

export function cloudCancelOrderVideo(place: string, video: string): Promise<void> {
	console.log('cloudCancelOrderVideo', place, video)
	return set(ref(database, 'things/' + place + '/req/u/' + getThingsProvider().getOrderKey() + '/video/' + video), null)
}

export function cloudOrderVideoTNUpTo(place: string, video: IVideo, wantTN?: number): Promise<void> {
	const value = wantTN === undefined ? null : ((video.hasTN || 0) + 1) + '-' + wantTN
	console.log('cloudOrderVideoTNUpTo', place, video.no, value)
	return set(ref(database, 'things/' + place + '/req/g/tn/' + formatNumberLeadingZeros(video.no, 8)), value)
}

export function cloudCancelOrderVideoTN(place: string, video: string): Promise<void> {
	console.log('cloudCancelOrderVideoTN', place, video)
	return set(ref(database, 'things/' + place + '/req/g/tn/' + video), null)
}

/*------------------------------------*/
