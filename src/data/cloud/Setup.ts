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

import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage, ref } from 'firebase/storage'
import { IPermissions } from '../Things'

/*------------------------------------*/

export const cloudStorageURLPrefix = 'https://storage.googleapis.com/'
export const cloudStorageBucket = '<YOUR-STORAGE-BUCKET>'
const config = {
	apiKey: '<YOUR-API-KEY>',
	authDomain: '<YOUR-AUTH-DOMAIN>',
	databaseURL: '<YOUR-FIREBASE-URL>',
	projectId: '<YOUR-PROJECT-ID>',
	storageBucket: cloudStorageBucket,
	messagingSenderId: '<YOUR-MSG-SENDER-ID>',
}
initializeApp(config)
export const database = getDatabase()
export const storage = getStorage()
export const dvrRoot = 'dvr'
export const dvrRef = ref(storage, dvrRoot)
export const syncRoot = 'sync'
export const fileRef = ref(storage, syncRoot)

/*------------------------------------*/
