/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2024 Aleksander Mazur
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

import { ref, onValue, child, Unsubscribe } from 'firebase/database'
import { DataProvider, DataStatus } from '../Provider'
import { TThingType, IThings, IThingsListener, IPermissions, IDevices, IVariables } from '../Things'
import { ICloudListener, IUserRecord, CloudConnection } from './Connection'
import { database } from './Setup'

/*------------------------------------*/

interface IOrdersGlobalDevices {
	[alias: string]: boolean
}

interface IOrdersGlobalVariables {
	[key: string]: string
}

interface IOrdersGlobalNeighbours {
	[name: string]: string
}

export interface IOrdersGlobalTN {
	[no: string]: string	// e.g. tn["01234567"] = "10-39"
}

export interface IOrdersToProxy {
	[cgi: string]: string	// e.g. post["finish-upgrade"] = "", post["sms"] = "to=+48...&content=Hello+world%21"
}

// should match rules defined for things/$place/req/g
interface IOrdersGlobal {
	d?: IOrdersGlobalDevices
	v?: IOrdersGlobalVariables
	n?: IOrdersGlobalNeighbours
	tn?: IOrdersGlobalTN
	post?: IOrdersToProxy
	now?: boolean
	period?: number
	minDelay?: number
	recListSync?: boolean
	recListMax?: number
	recMin?: number
	recMax?: number
	wantTN?: number
	logsSync?: boolean
	logsTS?: number
}

export interface IOrdersVideo {
	[no: string]: string	// file extension
}

export interface IOrdersLog {
	[log: string]: boolean
}

// should match rules defined for things/$place/req/u/$email + "global" where things/$place/req/g will be copied
export interface IOrders {
	video: IOrdersVideo
	log: IOrdersLog
	global?: IOrdersGlobal
}

interface IPlaceRecord {
	unsubNow?: Unsubscribe
	things?: IThings
	unsubOrderU?: Unsubscribe
	unsubOrderG?: Unsubscribe
	ordersU?: IOrders
	ordersG?: IOrdersGlobal
}

interface IUserView {
	[place: string]: IPlaceRecord
}

const isEverythingReady = (view: IUserView) => {
	for (const record of Object.values(view))
		if (!record.things)
			return false
	return true
}

/*------------------------------------*/

// sensors -> s, devices -> d, neighbours -> n
export const type2cloud = (type: TThingType): string => type.charAt(0)

export interface IOrdersListener {
	ordersChanged: (place: string, orders?: IOrders) => void
}

export interface IOrdersListenersPerPlace {
	[place: string]: IOrdersListener[]
}

type IDict = Record<string, any>

function processOrdersToDict(orders?: IDict, things?: IDict) {
	if (things)
		for (const id of Object.keys(things)) {
			const want = orders && orders[id]
			const old = things[id].want
			if (want !== old) {
				// must replace whole object, otherwise the change wouldn't be noticed by Vue
				if (want === undefined) {
					delete things[id].want
					things[id] = Object.assign({}, things[id])
				} else {
					things[id] = Object.assign({}, things[id], { want })
				}
			}
		}
}

/*------------------------------------*/

class CloudThingsHolder implements ICloudListener {
	private isConnected = false
	private user?: string
	private orderKey?: string
	private error?: string
	private record: IUserRecord = {}
	private things: IUserView = {}
	private ready = false	// when all X things[X].things are present
	private busy = false
	private status: DataStatus = 'unknown'
	private listeners: IThingsListener[] = []
	private ordersListeners: IOrdersListenersPerPlace = {}
	private allOrdersListeners: IOrdersListener[] = []	// registered for all places

	/* public methods */

	public readonly addListener = (listener: IThingsListener) => {
		if (this.listeners.includes(listener))
			throw new Error('Listener już dodany')
		this.listeners.push(listener)
		this.notifyStatus(listener)
	}

	public readonly removeListener = (listener: IThingsListener) => {
		this.listeners = this.listeners.filter((iterator: IThingsListener) => iterator !== listener)
	}

	public readonly addOrdersListener = (listener: IOrdersListener, place?: string) => {
		if (place !== undefined) {
			if (!this.ordersListeners[place])
				this.ordersListeners[place] = []
			if (this.ordersListeners[place].includes(listener))
				throw new Error('Listener już dodany')
			this.ordersListeners[place].push(listener)
		} else {
			if (this.allOrdersListeners.includes(listener))
				throw new Error('Listener już dodany')
			this.allOrdersListeners.push(listener)
		}
		this.notifyOrdersListeners(place, listener)
	}

	public readonly removeOrdersListener = (listener: IOrdersListener, place?: string) => {
		if (place !== undefined)
			this.ordersListeners[place] = this.ordersListeners[place].filter((iterator: IOrdersListener) => iterator !== listener)
		else
			this.allOrdersListeners = this.allOrdersListeners.filter((iterator: IOrdersListener) => iterator !== listener)
	}

	public action(cloudConnection: CloudConnection) {
		if (!this.isConnected || this.busy) {
			return
		}
		this.busy = true
		this.notifyStatus();
		(this.user ? cloudConnection.signOut() : cloudConnection.signIn()).then(() => {
			this.busy = false
			this.notifyStatus()
		})
	}

	public getOrderKey(): string | undefined {
		return this.orderKey
	}

	/* implementation of ICloudListener */

	public readonly connectionChanged = (isConnected: boolean) => {
		this.isConnected = isConnected
		this.notifyStatus()
	}

	public readonly authChanged = (user?: string) => {
		this.user = user
		this.notifyStatus()
	}

	public readonly authError = (code?: string, message?: string) => {
		this.error = message
		this.notifyStatus()
	}

	public readonly userChanged = (record: IUserRecord, orderKey?: string) => {
		//console.log('userChanged', record, orderKey)

		// process old places
		if (this.record && this.record.rel)
			for (const place of Object.keys(this.record.rel))
				if (this.record.rel[place]?.things && !(record?.rel && record.rel[place]?.things)) {
					// place removed or "things" permission revoked
					console.log('---', place)
					for (const listener of this.listeners)
						listener.placeRemoved(place)
					// clean up
					const placeRecord = this.things[place]
					if (placeRecord) {
						if (placeRecord.unsubNow)
							placeRecord.unsubNow()
						if (placeRecord.unsubOrderU)
							placeRecord.unsubOrderU()
						if (placeRecord.unsubOrderG)
							placeRecord.unsubOrderG()
						delete this.things[place]
					}
				}

		// process new places
		if (record && record.rel)
			for (const place of Object.keys(record.rel)) {
				const placeRecord = this.things[place]
				if (placeRecord) {
					const things = placeRecord.things
					if (things) {
						// just update permissions
						things.permissions = record.rel[place]
						for (const listener of this.listeners)
							listener.thingsChanged(place, things)
						// missing registration to req/u?
						if (orderKey && !placeRecord.unsubOrderU && record.rel[place]?.order)
							placeRecord.unsubOrderU = this.registerForOrdersU(place, orderKey)
						// missing registration to req/g?
						if (!placeRecord.unsubOrderG)
							placeRecord.unsubOrderG = this.registerForOrdersG(place)
					}
				} else if (record.rel[place]?.things) {
					// place added or "things" permission granted
					console.log('+++', place)
					for (const listener of this.listeners)
						listener.placeAdded(place)
					this.things[place] = {
						unsubNow: onValue(ref(database, 'things/' + place +  '/n'),
							(snap) => this.thingsChanged(place, snap && snap.val() || {}),
							(error) => console.warn('Błąd dostępu do rzeczy w', place, error)
						)
					}
					// register to req/u
					if (orderKey && record.rel[place]?.order)
						this.things[place].unsubOrderU = this.registerForOrdersU(place, orderKey)
					this.things[place].unsubOrderG = this.registerForOrdersG(place)
				}
			}

		this.ready = isEverythingReady(this.things)
		this.record = record
		this.orderKey = orderKey
		this.notifyStatus()
	}

	/* listeners */

	private readonly thingsChanged = (place: string, things: any) => {
		// ts in the cloud is our tsSV
		if (typeof things.ts === 'number')
			things.tsSV = things.ts
		delete things.ts
		if (this.record.rel && this.record.rel[place])
			things.permissions = this.record.rel[place]
		if (things.ui) {
			// move UI-specific data from ui to things
			if (things.ui.alias)
				things.alias = things.ui.alias
			for (const type of Object.keys(things.ui))
				if (type in things) {
					const ui = things.ui[type]
					if (typeof ui == 'object') {
						const now = things[type]
						for (const id of Object.keys(ui))
							if (id in now)
								Object.assign(now[id], ui[id])
					}
				}
			delete things.ui
		}
		things.sensors = typeof things.s !== 'object' ? {} : things.s
		delete things.s
		things.devices = typeof things.d !== 'object' ? {} : things.d
		delete things.d
		things.variables = typeof things.v !== 'object' ? {} : things.v
		delete things.v
		things.neighbours = typeof things.n !== 'object' ? {} : things.n
		delete things.n
		things.messages = []
		things.varByKey = {}
		for (const id of Object.keys(things.variables)) {
			const variable = things.variables[id]
			if (variable && !variable.key)
				variable.key = decodeURIComponent(id)
			things.varByKey[variable.key] = id
			// timestamp of "sys.next" is our ts (timestamp of whole status dump supplied by client)
			if (variable.key === 'sys.next') {
				things.ts = variable.ts
				things.next = parseInt(variable.value, 10)
				if (isNaN(things.next))
					delete things.next
			}
		}
		const placeRecord = this.things[place]
		const check = !placeRecord.things
		things = this.processOrdersToThings(things, placeRecord.ordersU)
		placeRecord.things = things
		for (const listener of this.listeners)
			listener.thingsChanged(place, things)
		if (check) {
			const ready = this.ready
			this.ready = isEverythingReady(this.things)
			if (ready != this.ready)
				this.notifyStatus()
		}
	}

	private readonly ordersChangedU = (place: string, orders: any) => {
		//console.log('ordersU @ ' + place, orders)
		const placeRecord = this.things[place]
		if (orders && placeRecord.ordersG)
			orders.global = placeRecord.ordersG
		placeRecord.ordersU = orders
		if (placeRecord.things) {
			// just update orders if thingsChanged has been already called
			placeRecord.things = this.processOrdersToThings(placeRecord.things, orders)
			for (const listener of this.listeners)
				listener.thingsChanged(place, placeRecord.things)
		}
		this.notifyOrdersListeners(place)
	}

	private readonly ordersChangedG = (place: string, orders: any) => {
		//console.log('ordersG @ ' + place, orders)
		const placeRecord = this.things[place]
		placeRecord.ordersG = orders
		if (placeRecord.ordersU) {
			placeRecord.ordersU.global = orders
			if (placeRecord.things) {
				// just update orders if thingsChanged has been already called
				placeRecord.things = this.processOrdersToThings(placeRecord.things, placeRecord.ordersU)
				for (const listener of this.listeners)
					listener.thingsChanged(place, placeRecord.things)
			}
		}
		this.notifyOrdersListeners(place)
	}

	/* private methods */

	private readonly registerForOrdersU = (place: string, orderKey: string) => {
		return onValue(ref(database, 'things/' + place +  '/req/u/' + orderKey),
			(snap) => this.ordersChangedU(place, snap && snap.val() || {}),
			(error) => console.warn('Błąd dostępu do zleceń użytkownika w', place, error)
		)
	}

	private readonly registerForOrdersG = (place: string) => {
		return onValue(ref(database, 'things/' + place +  '/req/g'),
			(snap) => this.ordersChangedG(place, snap && snap.val() || {}),
			(error) => console.warn('Błąd dostępu do zleceń w', place, error)
		)
	}

	private readonly processOrdersToThings = (things: IThings, orders?: IOrders): IThings => {
		processOrdersToDict(orders?.global?.d, things.devices)
		processOrdersToDict(orders?.global?.v, things.variables)
		return things
	}

	private readonly notifyStatus = (listener?: IThingsListener) => {
		const status =
			this.busy ? 'working' :
			!this.isConnected ? 'timeout' :
			!this.user ? 'auth' :
			!this.ready ? 'working' :
			'ok'
		const message = this.error || !this.isConnected || this.busy ? this.error : this.user ? 'Wyloguj' : 'Zaloguj'
		//console.log('status', this.status, '->', status, message)
		if (listener)
			listener.statusChanged(status, message)
		else
			for (const listener of this.listeners)
				listener.statusChanged(status, message)
		this.status = status
	}

	private readonly notifyOrdersListeners = (place?: string, listener?: IOrdersListener) => {
		if (place !== undefined) {
			const orders = this.things[place]?.ordersU
			if (listener) {
				listener.ordersChanged(place, orders)
			} else {
				const listeners = this.ordersListeners[place]
				if (listeners) {
					for (const listener of listeners)
						listener.ordersChanged(place, orders)
				}
				for (const listener of this.allOrdersListeners)
					listener.ordersChanged(place, orders)
			}
		} else for (const place of Object.keys(this.things)) {
			this.notifyOrdersListeners(place, listener)
		}
	}
}

/*------------------------------------*/

export class CloudThingsProvider extends DataProvider {
	private static cloudConnection?: CloudConnection
	public static holder?: CloudThingsHolder

	constructor(protected thingsListener: IThingsListener) {
		super()
	}

	/* implementation of DataProvider */

	public start() {
		super.start()
		if (!CloudThingsProvider.holder)
			CloudThingsProvider.holder = new CloudThingsHolder()
		if (!CloudThingsProvider.cloudConnection)
			CloudThingsProvider.cloudConnection = new CloudConnection(CloudThingsProvider.holder)
		CloudThingsProvider.holder.addListener(this.thingsListener)
	}

	public stop() {
		super.stop()
		if (CloudThingsProvider.holder)
			CloudThingsProvider.holder.removeListener(this.thingsListener)
	}

	public action() {
		if (CloudThingsProvider.holder && CloudThingsProvider.cloudConnection)
			CloudThingsProvider.holder.action(CloudThingsProvider.cloudConnection)
	}
}

/*------------------------------------*/

export function getThingsProvider(): CloudThingsHolder {
	const holder = CloudThingsProvider.holder
	if (!holder)
		throw new Error('Niezainicjowana chmura')
	return holder
}
