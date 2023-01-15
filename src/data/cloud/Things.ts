/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020 Aleksander Mazur
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

import { DataSnapshot, DatabaseReference,
	ref, onChildAdded, onChildRemoved, onValue, child, off,
} from 'firebase/database'
import { DataProvider } from '../Provider'
import { IThings, IThingsListener, IPermissions } from '../Things'
import cloud, { ICloudListener, database } from './Setup'

/*------------------------------------*/

interface IThingsDict {
	[place: string]: IThings | null
}

interface IPlacesDict {
	[place: string]: IPermissions | null
}

/*------------------------------------*/

export class CloudThingsProvider extends DataProvider implements ICloudListener {
	private isConnected?: boolean
	private user?: string
	private ref?: DatabaseReference
	private things: IThingsDict = {}
	private places: IPlacesDict = {}
	private wakeup?: boolean
	private statusNotified = false

	constructor(protected thingsListener: IThingsListener) {
		super()
	}

	public start() {
		super.start()
		cloud.addListener(this)
	}

	public stop() {
		super.stop()
		cloud.removeListener(this)
	}

	public readonly connectionChanged = (isConnected: boolean) => {
		this.isConnected = isConnected
		this.notifyStatusOnConnectionOrAuthChange()
	}

	public readonly authChanged = (user?: string, errorMsg?: string) => {
		this.user = user
		this.statusNotified = false
		this.notifyStatusOnConnectionOrAuthChange()
		if (user) {
			this.ref = ref(database, 'user/' + user)
			const placesRef = child(this.ref, 'places')
			onChildAdded(placesRef, this.placeAdded)
			onChildRemoved(placesRef, this.placeRemoved)
			onValue(child(this.ref, 'wakeup'), this.wakeupChanged)
		} else {
			if (this.ref) {
				const placesRef = child(this.ref, 'places')
				off(placesRef, 'child_added')
				off(placesRef, 'child_removed')
				off(child(this.ref, 'wakeup'), 'value')
			}
			this.ref = undefined
			this.thingsListener.statusChanged('auth', errorMsg)
			this.places = {}
			this.thingsListener.placeRemoved()
		}
	}

	private readonly notifyStatusOnConnectionOrAuthChange = () => {
		const status =
			!this.isConnected ? 'timeout' :
			!this.user ? 'auth' :
			!this.statusNotified ? 'working' :
			'ok'
		this.thingsListener.statusChanged(status)
	}

	private readonly placeAdded = (snap: DataSnapshot | null) => {
		if (!snap || !snap.key)
			return
		const place = snap.key
		console.log('+++', place)
		this.thingsListener.placeAdded(place)
		onValue(snap.ref, (snap2: DataSnapshot | null) =>
			this.placeChanged(place, snap2))
	}

	private readonly placeRemoved = (snap: DataSnapshot | null) => {
		if (!snap || !snap.key)
			return
		const place = snap.key
		console.log('---', place)
		off(snap.ref, 'value')
		this.placeChanged(place, null)
		this.thingsListener.placeRemoved(place)
		delete this.places[place]
	}

	private readonly placeChanged = (place: string, snap: DataSnapshot | null) => {
		//console.log('place @ ' + place, snap !== null)
		if (!this.statusNotified) {
			this.thingsListener.statusChanged('ok')
			this.statusNotified = true
		}
		let unregister = true
		if (snap) {
			if (!snap.exists() || !snap.key)
				return
			const permissions = snap.val()
			permissions.useWakeup = this.wakeup
			this.places[place] = permissions
			//console.log('place @ ' + place, 'permissions.things = ' + permissions.things)
			if (permissions.things) {
				unregister = false
				// is thingsChanged listener already registered?
				if (this.things[place]) {
					// just update permissions if thingsChanged has been already called
					const things = this.things[place]
					if (things) {
						things.permissions = permissions
						this.thingsListener.thingsChanged(place, things)
					}
				} else {
					// register thingsChanged listener
					//console.log('place @ ' + place, 'register')
					onValue(ref(database, 'things/' + place + '/now'), (snap2: DataSnapshot | null) =>
						this.thingsChanged(place, snap2))
					// this means that thingsChanged listener is registered
					this.things[place] = null
				}
			}
		}
		if (unregister) {
			//console.log('place @ ' + place, 'unregister')
			off(ref(database, 'things/' + place + '/now'), 'value')
			this.thingsChanged(place, null)
			// this means that thingsChanged listener is unregistered
			delete this.things[place]
		}
	}

	private readonly thingsChanged = (place: string, snap: DataSnapshot | null) => {
		//console.log('things @ ' + place, snap !== null)
		const things = snap && snap.exists() && snap.key ? snap.val() : {}
		things.ts = typeof things.ts === 'number'
			? things.ts
			: (typeof things.request === 'object' && typeof things.request.ts === 'number'
				? things.request.ts
				: Date.now()
			) / 1000
		if (this.places[place])
			things.permissions = this.places[place]
		if (typeof things.sensors !== 'object')
			things.sensors = {}
		if (typeof things.devices !== 'object')
			things.devices = {}
		if (typeof things.variables !== 'object')
			things.variables = {}
		if (typeof things.messages !== 'object')
			things.messages = []
		if (things.request && typeof things.request !== 'object')
			things.request = {}
		if (things.request && things.request.generic !== undefined) {
			// extract current user only (caller doesn't know uid)
			things.request.generic = typeof things.request.generic === 'object' &&
				this.user !== undefined &&
				things.request.generic[this.user]
				? things.request.generic[this.user]
				: undefined
		}
		this.things[place] = things
		this.thingsListener.thingsChanged(place, things)
	}

	private readonly wakeupChanged = (snap: DataSnapshot | null) => {
		if (!snap || !snap.exists())
			return
		const wakeup = snap.val()
		if (wakeup !== undefined && wakeup !== true && wakeup !== false)
			return
		console.log('permission to wake up:', wakeup)
		this.wakeup = wakeup
		for (const place in this.places) {
			let permissions = this.places[place]
			if (!permissions)
				permissions = this.places[place] = {}
			permissions.useWakeup = this.wakeup
			const things = this.things[place]
			if (things) {
				things.permissions = permissions
				this.thingsListener.thingsChanged(place, things)
			}
		}
	}
}

/*------------------------------------*/
