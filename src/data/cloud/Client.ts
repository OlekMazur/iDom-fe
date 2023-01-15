/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020 Aleksander Mazur
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

import { ref, set } from 'firebase/database'
import { ref as child, getDownloadURL, getMetadata, uploadBytes } from 'firebase/storage'
import { fetch as polyFetch } from 'whatwg-fetch'
import { sha256 } from 'js-sha256'
import { fileRef, database } from './Setup'

const fetch = window.fetch || polyFetch

const commonFetchOptions: RequestInit = {
	mode: 'cors',
	redirect: 'error',
	keepalive: true,
}

/*
function cloudFileDBRef(fn: string) {
	if (fn.indexOf('/') >= 0)
		throw new Error('Nieprawidłowa nazwa pliku: ' + fn)
	return encodeURIComponent(fn).replace(/\./g, '%2E')
}
*/

function cloudFileStorageRef(fn: string, cksum: string) {
	if (fn.indexOf('/') >= 0)
		throw new Error('Nieprawidłowa nazwa pliku: ' + fn)
	if (!/^[0-9a-fA-F]{64}$/.test(cksum))
		throw new Error('Nieprawidłowa suma kontrolna: ' + cksum)
	return child(fileRef, fn + '.' + cksum)
}

export function cloudDownloadFile(place: string, fn: string, cksum: string): Promise<Response> {
	return getDownloadURL(cloudFileStorageRef(fn, cksum))
	.then((url: string) => fetch(url, commonFetchOptions))
	.then((response: Response) => {
		if (!response.ok)
			throw new Error('Błąd ' + response.status + ': ' + response.statusText)
		return response
	})
}

export function cloudUploadFile(place: string, fn: string, data: ArrayBuffer, variableID: string): Promise<void> {
	console.log('cloudUploadFile', place, fn, data.byteLength, variableID)
	const cksum = sha256(data)
	console.log('cksum:', cksum)
	const file = cloudFileStorageRef(fn, cksum)
	return getMetadata(file)
	//.then(() => {})	// promise fulfills if file exists
	.catch(() => uploadBytes(file, data, {
		contentType: 'application/octet-stream',
		cacheControl: 'private, max-age=31536000',
	})).then(() => {
		if (variableID)
			return set(ref(database, `things/${place}/now/variables/${variableID}/want`), cksum)
	})
}
