/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020, 2021, 2022, 2024 Aleksander Mazur
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
import { database } from './Setup'
import { type2cloud } from './Things'
import { TThingType } from '../Things'
import { encodeArgs } from '../Client'

export function cloudSwitchDevice(place: string, id: string, want: boolean | null): Promise<void> {
	console.log('cloudSwitchDevice', place, id, want)
	return set(ref(database, `things/${place}/req/g/d/${id}`), want)
}

export function cloudSetThingColor(place: string, type: TThingType, id: string, color: string | null): Promise<void> {
	console.log('cloudSetThingColor', place, type, id, color)
	return set(ref(database, `things/${place}/n/ui/${type2cloud(type)}/${id}/color`), color)
}

export function cloudRenameThing(place: string, type: TThingType, id: string, alias: string): Promise<void> {
	console.log('cloudRenameThing', place, type, id, alias)
	return set(ref(database, `things/${place}/req/g/${type2cloud(type)}/${id}`), alias)
}

export function cloudSetParameter(place: string, parameter: string, value?: number | boolean | null): Promise<void> {
	console.log('cloudSetParameter', place, parameter, value)
	return set(ref(database, `things/${place}/req/g/${parameter}`), value === undefined ? null : value)
}

export function cloudRequestPOST(place: string, cgi: string, value?: string): Promise<void> {
	console.log('cloudRequestPOST', place, cgi, value)
	return set(ref(database, `things/${place}/req/g/post/${cgi}`), value === undefined ? null : value)
}

export function cloudSendUSSD(place: string, ussd: string): Promise<void> {
	return cloudRequestPOST(place, 'ussd', encodeArgs({
		ussd,
	}))
}

export function cloudSendSMS(place: string, to: string, content: string): Promise<void> {
	return cloudRequestPOST(place, 'sms', encodeArgs({
		to,
		content,
	}))
}

export function cloudPurgeMessages(place: string, group: string): Promise<void> {
	return cloudRequestPOST(place, 'msg-purge', encodeArgs({
		group,
	}))
}

export function cloudWakeUp(place: string, up?: boolean): Promise<void> {
	console.log('cloudWakeUp', place, up)
	return cloudSetParameter(place, 'now', up === false ? false : true)
}
