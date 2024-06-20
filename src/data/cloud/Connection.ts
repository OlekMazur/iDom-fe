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

import { DataSnapshot, Unsubscribe,
	ref, push, set, onValue, onDisconnect, serverTimestamp,
} from 'firebase/database'
import { GoogleAuthProvider, User, AuthError,
	getAuth, useDeviceLanguage, onAuthStateChanged, signInWithPopup, signOut,
} from 'firebase/auth'
import { database } from './Setup'
import { IPermissions } from '../Things'

/*------------------------------------*/

export interface IRelatedDict {
	[place: string]: IPermissions
}

export interface IUserSessions {
	[session: string]: number
}

export interface IUserRecord {
	email?: string
	rel?: IRelatedDict
	sessions?: IUserSessions
	lastSeen?: number
}

/** Listener to cloud connection- & authentication-related events. */
export interface ICloudListener {
	/**
	 * Notifies about state of ".info/connected".
	 *
	 * @see https://firebase.google.com/docs/database/web/offline-capabilities#section-connection-state
	 *
	 * @param isConnected Whether our Firebase client is online at the moment.
	 */
	connectionChanged: (isConnected: boolean) => void
	/**
	 * Notifies about authentication state.
	 *
	 * @see https://firebase.google.com/docs/auth/web/start#sign_in_existing_users
	 *
	 * @param uid ID of the signed-in user, or undefined.
	 */
	authChanged: (uid?: string) => void
	/**
	 * Notifies about authentication error.
	 *
	 * @see https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithpopup
	 */
	authError: (code?: string, message?: string) => void
	/**
	 * Notifies about updates of signed-in user record in the database.
	 *
	 * Called also on auth change.
	 *
	 * @param record User data.
	 * @param orderKey Subpath to be used when user orders something.
	 */
	userChanged: (record: IUserRecord, orderKey?: string) => void
}

/*------------------------------------*/

export class CloudConnection {
	private auth = getAuth()
	private isConnected = false
	private uid?: string
	private unsubscribe?: Unsubscribe
	private record: IUserRecord = {}
	private orderKey?: string
	private presenceToDo = false
	private authErrorCode?: string
	private authErrorMsg?: string

	constructor(private listener: ICloudListener) {
		onValue(ref(database, '.info/connected'),
			(snap: DataSnapshot | null) => this.connectionChanged(snap && snap.val()))
		useDeviceLanguage(this.auth)
		onAuthStateChanged(this.auth, this.authChanged, this.authError)
	}

	/* public methods */

	public readonly signIn = (): Promise<void> => {
		return signInWithPopup(this.auth, new GoogleAuthProvider())
		.then((user) => console.log('Zalogowany jako', user && user.user && user.user.uid))
	}

	public readonly signOut = (): Promise<void> => {
		return signOut(this.auth)
		.then((user) => console.log('Wylogowany'))
	}

	/* listeners */

	private readonly connectionChanged = (isConnected: boolean) => {
		console.log('Połączenie z chmurą', this.isConnected, '->', isConnected)
		if (this.isConnected == isConnected)
			return;
		this.isConnected = isConnected
		if (isConnected) {
			if (this.uid)
				this.presenceOn()
			else
				this.presenceToDo = true
		} else {
			this.presenceToDo = false
			// the triggers registered by presenceOn should do the job
			// so there is no presenceOff method
		}
		this.listener.connectionChanged(this.isConnected)
	}

	private readonly authChanged = (user: User | null) => {
		this.uid = user && user.uid || undefined
		this.authErrorMsg = undefined
		console.log('Autoryzacja w chmurze jako', this.uid, this.presenceToDo)
		if (this.unsubscribe) {
			// unsubscribe from previous user record
			this.unsubscribe()
			this.unsubscribe = undefined
		}
		this.listener.authChanged(this.uid)
		if (this.uid) {
			// clear previous auth errors
			this.authErrorCode = this.authErrorMsg = undefined
			// subscribe to user record
			this.unsubscribe = onValue(ref(database, 'user/' + this.uid),
				this.userChanged,
				(error) => console.warn('Błąd dostępu do użytkownika', this.uid, error)
			)
			if (this.presenceToDo)	// we have already been notified about being connected, but didn't have user ID
				this.presenceOn()
		} else {
			// this.userChanged won't be called
			this.record = {}
			this.orderKey = undefined
			this.listener.userChanged(this.record, this.orderKey)
		}
	}

	private readonly authError = (e: Error) => {
		const error = e as AuthError
		console.warn('Błąd autoryzacji w chmurze jako', this.uid, error.code, error.message)
		this.authErrorCode = error.code
		this.authErrorMsg = error.message
		this.listener.authError(this.authErrorCode, this.authErrorMsg)
	}

	private readonly userChanged = (snap: DataSnapshot | null) => {
		const record = snap && snap.val() || {}
		//console.log('Użytkownik', record)
		this.record = record
		this.orderKey = record.email && record.email.replace(/\./g, '%2E') || undefined
		this.listener.userChanged(this.record, this.orderKey)
	}

	/* private methods */

	private readonly presenceOn = () => {
		const session = push(ref(database, 'user/' + this.uid + '/sessions'))
		console.log('Obecność w chmurze jako', this.uid, this.isConnected, session.key)
		onDisconnect(session)
		.remove()
		.then(() => {// "remove on disconnect" handler successfully registered at the server
			set(session, serverTimestamp())
		}).catch((err) => {
			console.error('Błąd zgłaszania obecności:', err);
		})
		onDisconnect(ref(database, 'user/' + this.uid + '/lastSeen')).set(serverTimestamp())
		this.presenceToDo = false
	}
}

/*------------------------------------*/
