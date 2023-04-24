/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2023 Aleksander Mazur
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

import { IThings } from './data/Things'
import { getVariablesIndexedByKey } from './data/API'
import { strToInt } from './utils'
import { storageLoadStr } from './storage'

interface IRecMaxAtPlace {
	[place: string]: number
}

interface IPlacesExcluded {
	[place: string]: boolean
}

export class NotificationHub {
	private prev: IRecMaxAtPlace = {}
	private excluded: IPlacesExcluded = {}
	public readonly supported: boolean = 'Notification' in window
	private granted: boolean = this.supported && Notification.permission === 'granted'

	constructor() {
		for (const place of storageLoadStr('notificationPlacesExcluded').split(','))
			if (place)
				this.excluded[place] = true
	}

	public readonly isGranted = (): boolean => this.granted

	public readonly requestPermission = (): Promise<void> => Notification.requestPermission().then((permission: string) => {
		if (permission === 'granted') {
			this.granted = true
			return
		}
		throw new Error('Brak zezwolenia na powiadomienia')
	})

	public readonly updateThings = (place: string, things: IThings) => {
		let current = NaN
		try {
			current = strToInt(getVariablesIndexedByKey(things && things.variables)['rec.max'].value)
		} catch (e) {
			current = NaN
		}
		if (this.granted && place in this.prev && this.prev[place] !== current) {
			new Notification(`@${place} = ${current}`)
		}
		this.prev[place] = current
	}
}
