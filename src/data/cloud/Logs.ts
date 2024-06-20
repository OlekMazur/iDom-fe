/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021, 2023, 2024 Aleksander Mazur
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
	ref, query, orderByKey, onValue, off, set, child, limitToLast,
} from 'firebase/database'
import { database } from './Setup'
import { getThingsProvider, IOrdersListener, IOrdersLog, IOrders } from './Things'
import { ILogFile, TLogsListener } from '../API'

/*------------------------------------*/

class CloudLogsQuery implements IOrdersListener {
	private unsubscribe: Unsubscribe
	private snapshot: ILogFile[] = []
	private orders: IOrdersLog | undefined
	private ts: number | undefined

	constructor(private place: string, private listener: TLogsListener, limit?: number) {
		//console.log('CloudLogsQuery', place, limit)
		const constraints = [orderByKey()]
		if (limit)
			constraints.push(limitToLast(limit))
		this.unsubscribe = onValue(query(ref(database, 'things/' + place + '/logs'), ...constraints),
			this.snapshotChanged,
			(e) => console.error(e)
		)
		getThingsProvider().addOrdersListener(this, place)
	}

	public readonly destroy = (): void => {
		//console.log('CloudLogsQuery.destroy', this.place)
		getThingsProvider().removeOrdersListener(this, this.place)
		this.unsubscribe()
	}

	private readonly snapshotChanged = (snap: DataSnapshot | null): void => {
		const result: ILogFile[] = []
		if (snap)
			snap.forEach((iter: DataSnapshot | null) => {
				if (!iter || !iter.key)
					return
				const elem = iter.val()
				if (!elem
					|| typeof elem !== 'object'
					|| typeof elem.size !== 'number'
					|| (elem.desc && typeof elem.desc !== 'string'))
					throw new Error('Nieprawidłowe dane dziennika')
				elem.name = iter.key
				const order = this.orders && this.orders[elem.name]
				if (order !== undefined)
					elem.order = order
				result.push(elem)
			})
		this.snapshot = result
		//console.log('snapshotChanged', this.place, this.snapshot)
		this.notifyListener()
	}

	public readonly ordersChanged = (place: string, orders?: IOrders): void => {
		if (place !== this.place)
			return;
		this.ts = orders?.global?.logsTS
		this.orders = orders?.log
		//console.log('ordersChanged', this.place, this.orders, this.ts)
		const result = this.snapshot
		if (result) {
			let dirty = 0
			for (let i = 0; i < result.length; i++) {
				const elem = result[i]
				const old = elem.order
				const order = this.orders && this.orders[elem.name]
				if (order !== old) {
					if (order !== undefined)
						elem.order = order
					else
						delete elem.order
					result[i] = Object.assign({}, elem, { order })
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
		this.listener(this.place, this.snapshot, this.ts)
	}
}

/*------------------------------------*/

export function cloudLogsRegisterListener(place: string, listener: TLogsListener, limit?: number): CloudLogsQuery {
	return new CloudLogsQuery(place, listener, limit)
}

export function cloudLogsUnregisterListener(query: CloudLogsQuery) {
	query.destroy()
}

/*------------------------------------*/

export function cloudOrderLog(place: string, name: string, order: boolean): Promise<void> {
	console.log('cloudOrderLog', place, name, order)
	return set(ref(database, 'things/' + place + '/req/u/' + getThingsProvider().getOrderKey() + '/log/' + name), order || null)
}

export function cloudLogsForceSync(place: string): Promise<void> {
	console.log('cloudLogsForceSync', place)
	return set(ref(database, 'things/' + place + '/req/g/logsTS'), null)
}

/*------------------------------------*/
