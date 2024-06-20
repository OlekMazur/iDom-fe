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

import { DataSnapshot, Query,
	onValue, ref, query, get, set, update, off,
	orderByKey, startAt, endAt, limitToLast, limitToFirst,
} from 'firebase/database'
import { database } from './Setup'
import { IHistoryEntry, ThingType, THistoryListener } from '../History'
import { type2cloud } from './Things'
import { strToInt } from '../../utils'
import { MAX_DELETE_ENTRIES_AT_ONCE } from '../../config'

/*------------------------------------*/

interface IBatchDelete {
	[subpath: string]: null
}

/*------------------------------------*/

function cloudHistoryHandleCallback(
	place: string,
	type: ThingType,
	id: string,
	cb: THistoryListener,
	q: Query): void {

	onValue(q, (snap: DataSnapshot | null) => {
		const history: IHistoryEntry[] = []

		if (snap) {
			const expectedType = type === 'sensors' ? 'number'
				: type === 'devices' || type === 'neighbours' ? 'boolean'
				: 'undefined'

			snap.forEach((child: DataSnapshot | null) => {
				if (!child)
					return
				const ts = child.key
				const value = child.val()
				if (!ts || !/^\d+$/.test(ts) || typeof value !== expectedType)
					throw new Error('Nieprawidłowa odpowiedź serwera')
				history.push({
					ts: strToInt(ts),
					value,
				})
			})
		}

		cb(place, type, id, history)
	}, (e) => console.error(e))
}

export function cloudHistoryRegisterListener(
	place: string,
	type: ThingType,
	id: string,
	tsMin: number,
	tsMax: number,
	cb: THistoryListener) {

	const q = query(ref(database, 'things/' + place + '/h/' + type2cloud(type) + '/' + id),
		orderByKey(),
		startAt(tsMin.toString()),
		endAt(tsMax.toString()),
	)
	cloudHistoryHandleCallback(place, type, id, cb, q)
	return q
}

export function cloudHistoryRegisterListenerNewest(
	place: string,
	type: ThingType,
	id: string,
	cntMax: number,
	cb: THistoryListener) {

	const q = query(ref(database, 'things/' + place + '/h/' + type2cloud(type) + '/' + id),
		orderByKey(),
		limitToLast(cntMax),
	)
	cloudHistoryHandleCallback(place, type, id, cb, q)
	return q
}

export function cloudHistoryRegisterOldestEntryListener(
	place: string,
	type: ThingType,
	id: string,
	cb: THistoryListener) {

	const q = query(ref(database, 'things/' + place + '/h/' + type2cloud(type) + '/' + id),
		orderByKey(),
		limitToFirst(1),
	)
	cloudHistoryHandleCallback(place, type, id, cb, q)
	return q
}

export function cloudHistoryUnregisterListener(q: Query) {
	off(q, 'value')
}

/*------------------------------------*/

export function cloudHistoryDeleteEntry(
	place: string,
	type: ThingType,
	id: string,
	ts: number): Promise<void> {

	console.log('cloudHistoryDeleteEntry', place, type, id, ts)
	return set(ref(database, 'things/' + place + '/h/' + type2cloud(type) + '/' + id + '/' + ts), null)
}

export function cloudHistoryDeleteEntriesOlderThan(
	place: string,
	type: ThingType,
	id: string,
	tsMax: number): Promise<boolean> {

	console.log('cloudHistoryDeleteEntriesOlderThan', place, type, id, tsMax)
	return get(query(ref(database, 'things/' + place + '/h/' + type2cloud(type) + '/' + id),
		orderByKey(),
		endAt((tsMax - 1).toString()),
		limitToFirst(MAX_DELETE_ENTRIES_AT_ONCE),
	)).then((snap: DataSnapshot | null) => {
		if (snap) {
			const record: IBatchDelete = {}
			let count = 0

			snap.forEach((iter: DataSnapshot | null) => {
				if (iter && iter.key) {
					record[iter.key] = null
					count++
				}
			})

			if (count) {
				console.log('cloudHistoryDeleteEntriesOlderThan', tsMax, snap.ref.toString(), count, MAX_DELETE_ENTRIES_AT_ONCE)
				return update(snap.ref, record)
				.then(() => count === MAX_DELETE_ENTRIES_AT_ONCE)
			}
		}

		return false
	})
}

/*------------------------------------*/
