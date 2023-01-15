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

import { initializeApp } from 'firebase/app'
import { DataSnapshot,
	getDatabase, ref, push, set, onValue, onDisconnect, serverTimestamp,
} from 'firebase/database'
import { GoogleAuthProvider, User,
	getAuth, useDeviceLanguage, onAuthStateChanged, signInWithPopup, signOut,
} from 'firebase/auth'
import { getStorage, ref as child } from 'firebase/storage'

/*------------------------------------*/

export const cloudStorageURLPrefix = 'https://storage.googleapis.com/'
export const cloudStorageBucket = '<YOUR-STORAGE-BUCKET>'
const config = {
	apiKey: '<YOUR-API-KEY>',
	authDomain: '<YOUR-AUTH-DOMAIN>',
	databaseURL: 'https://<YOUR-FIREBASE-URL>',
	projectId: '<YOUR-PROJECT-ID>',
	storageBucket: cloudStorageBucket,
	messagingSenderId: '<YOUR-MSG-SENDER-ID>',
}
initializeApp(config)
const auth = getAuth()
export const database = getDatabase()
export const storage = getStorage()
export const dvrRoot = 'dvr'
export const dvrRef = child(storage, dvrRoot)
export const syncRoot = 'sync'
export const fileRef = child(storage, syncRoot)

/*------------------------------------*/

export interface ICloudListener {
	connectionChanged: (isConnected: boolean) => void
	authChanged: (uid?: string, errorMsg?: string) => void
}

/*------------------------------------*/

class CloudConnection {
	private isConnected = false
	private uid?: string
	private presenceToDo = false
	private authErrorMsg?: string
	private listeners: ICloudListener[] = []

	constructor() {
		onValue(ref(database, '.info/connected'),
			(snap: DataSnapshot | null) => this.connectionChanged(snap && snap.val()))
		useDeviceLanguage(auth)
		onAuthStateChanged(auth,
			(user: User | null) => this.authChanged(user),
			(error: Error) => this.authError(error.message))
		//this.signIn()
	}

	public readonly getUID = (): string | undefined => {
		return this.uid
	}

	public readonly addListener = (listener: ICloudListener) => {
		if (this.listeners.includes(listener))
			throw new Error('Listener już dodany')
		this.listeners.push(listener)
		listener.connectionChanged(this.isConnected)
		listener.authChanged(this.uid, this.authErrorMsg)
	}

	public readonly removeListener = (listener: ICloudListener) => {
		this.listeners = this.listeners.filter((iterator: ICloudListener) => iterator !== listener)
	}

	public readonly signIn = (): Promise<void> => {
		return signInWithPopup(auth, new GoogleAuthProvider())
		.then((user) => console.log('signIn', user))
	}

	public readonly signOut = (): Promise<void> => {
		return signOut(auth)
	}

	private readonly connectionChanged = (isConnected: boolean) => {
		console.log('połączenie z chmurą', this.isConnected, '->', isConnected)
		this.isConnected = isConnected
		if (isConnected) {
			if (this.uid)
				this.presenceOn()
			else
				this.presenceToDo = true
		} else {
			this.presenceToDo = false
		}
		for (const listener of this.listeners)
			listener.connectionChanged(isConnected)
	}

	private readonly authChanged = (user: User | null) => {
		this.uid = user ? user.uid : undefined
		console.log('autoryzacja w chmurze jako', this.uid, this.presenceToDo)
		if (this.uid && this.presenceToDo)
			this.presenceOn()
		this.authErrorMsg = undefined
		for (const listener of this.listeners)
			listener.authChanged(this.uid)
	}

	private readonly authError = (errorMsg: string) => {
		console.warn('błąd autoryzacji w chmurze jako', this.uid, errorMsg)
		this.authErrorMsg = errorMsg
		for (const listener of this.listeners)
			listener.authChanged(this.uid, errorMsg)
	}

	private readonly presenceOn = () => {
		const session = push(ref(database, 'user/' + this.uid + '/sessions'))
		console.log('obecność w chmurze jako', this.uid, this.isConnected, session.key)
		onDisconnect(session).remove()
		set(session, serverTimestamp())
		onDisconnect(ref(database, 'user/' + this.uid + '/lastSeen')).set(serverTimestamp())
		this.presenceToDo = false
	}
}

/*------------------------------------*/
/*
export function signIn():  {
	const provider = new firebase.auth.GoogleAuthProvider()
	return firebase.auth().signInWithPopup(provider)
	.then((result) => result.user ? result.user.uid : undefined)
	.catch((error) => {
		console.log(error)
		if (error.code.startsWith('auth/popup')) {
			firebase.auth().signInWithRedirect(provider)
			return firebase.auth().getRedirectResult()
			.then((result) => result.user ? result.user.uid : undefined)
		}
		throw error
	}).catch((error) => {
		console.log(error)
		throw new Error(error.code + ': ' + error.message)
	})
}
*/

export function queryIdToken(): Promise<string> {
	if (auth.currentUser)
		return auth.currentUser.getIdToken()
	throw new Error('Niezalogowany')
}

/*------------------------------------*/

const cloud = new CloudConnection()
export default cloud
