/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021, 2023 Aleksander Mazur
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
	ref, query, orderByKey, onValue, off, set, child, limitToLast,
} from 'firebase/database'
import cloud, { database } from './Setup'
import { ILogFile, TLogsListener } from '../API'

/*------------------------------------*/

function cloudGetSnapLogs(snap: DataSnapshot | null): ILogFile[] {
	const result: ILogFile[] = []
	if (snap)
		snap.forEach((iter: DataSnapshot | null) => {
			if (!iter || !iter.key)
				return
			const log = iter.val()
			if (!log
				|| typeof log !== 'object'
				|| typeof log.size !== 'number'
				|| (log.desc && typeof log.desc !== 'string'))
				throw new Error('Nieprawidłowe dane dziennika')
			log.name = iter.key
			result.push(log)
		})
	//console.log('cloudGetSnapLogs', result.length)
	return result
}

/*------------------------------------*/

export function cloudLogsRegisterListener(place: string, listener: TLogsListener, limit?: number) {
	//console.log('cloudLogsRegisterListener', place, limit)
	const constraints = [orderByKey()]
	if (limit)
		constraints.push(limitToLast(limit))
	const q = query(ref(database, 'things/' + place + '/logs'), ...constraints)
	onValue(q, (snap: DataSnapshot | null) => {
		listener(place, cloudGetSnapLogs(snap))
	}, (e) => console.error(e))
	return q
}

export function cloudLogsUnregisterListener(q: Query) {
	off(q, 'value')
}

/*------------------------------------*/

export function cloudOrderLog(place: string, name: string, order: boolean): Promise<void> {
	const value = order ? cloud.getUID() : null
	console.log('cloudOrderLog', place, name, order, value)
	const base = ref(database, 'things/' + place)
	return set(child(base, 'logs/' + name + '/order'), value)
	.then(() => {
		if (value)
			return set(child(base, 'now/request/orderLog'), true)
	})
}

export function cloudLogsForceSync(place: string): Promise<void> {
	console.log('cloudLogsForceSync', place)
	return set(ref(database, 'things/' + place + '/now/request/logListSyncTS'), null)
}

/*------------------------------------*/
