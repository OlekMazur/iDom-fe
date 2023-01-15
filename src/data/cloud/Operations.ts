/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020, 2021, 2022 Aleksander Mazur
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
import cloud, { database } from './Setup'
import { TThingType, IGenericParams } from '../Things'

export function cloudSwitchDevice(place: string, id: string, want: boolean | null): Promise<void> {
	console.log('cloudSwitchDevice', place, id, want)
	return set(ref(database, `things/${place}/now/devices/${id}/want`), want)
}

export function cloudSetThingColor(place: string, type: TThingType, id: string, color: string | null): Promise<void> {
	console.log('cloudSetThingColor', place, type, id, color)
	return set(ref(database, `things/${place}/now/${type}/${id}/color`), color)
}

export function cloudRenameThing(place: string, type: TThingType, id: string, alias: string): Promise<void> {
	console.log('cloudRenameThing', place, type, id, alias)
	return set(ref(database, `things/${place}/now/${type}/${id}/rename`), alias)
}

export function cloudRemoveThing(place: string, type: TThingType, id: string): Promise<void> {
	console.log('cloudRemoveThing', place, type, id)
	return set(ref(database, `things/${place}/now/${type}/${id}/remove`), true)
}

/**
 * Wakes up client/terminal at a place associated with given wake up session.
 *
 * @param session Wake up session held at "things/$place/now/request/wakeup".
 */
export function cloudWakeUp(session: string): Promise<void> {
	console.log('cloudWakeUp', session)
	return set(ref(database, `wakeup/${session}`), Date.now())
}

export function cloudWakeUpReset(place: string): Promise<void> {
	console.log('cloudWakeUpReset')
	return set(ref(database, `things/${place}/now/request/wakeup`), null)
}

export function cloudOrderGeneric(place: string, generic: string, want: boolean | IGenericParams): Promise<void> {
	console.log('cloudOrderGeneric', place, generic, want)
	const uid = cloud.getUID()
	return set(ref(database, `things/${place}/now/request/generic/${uid}/${generic}`), want)
}

export function cloudSendUSSD(place: string, ussd: string): Promise<void> {
	return cloudOrderGeneric(place, 'ussd', {
		ussd,
	})
}

export function cloudSendSMS(place: string, to: string, content: string): Promise<void> {
	return cloudOrderGeneric(place, 'sms', {
		to,
		content,
	})
}

export function cloudSetMaxTN(place: string, maxTN?: number): Promise<void> {
	console.log('cloudSetMaxTN', place, maxTN)
	return set(ref(database, `things/${place}/now/request/maxTN`), maxTN === undefined ? null : maxTN)
}

export function cloudSetMaxTNAtOnce(place: string, maxTNAtOnce?: number): Promise<void> {
	console.log('cloudSetMaxTNAtOnce', place, maxTNAtOnce)
	return set(ref(database, `things/${place}/now/request/maxTNAtOnce`), maxTNAtOnce === undefined ? null : maxTNAtOnce)
}

export function cloudSetRecListSync(place: string, want: boolean): Promise<void> {
	console.log('cloudSetRecListSync', place, want)
	return set(ref(database, `things/${place}/now/request/recListSync`), want)
}

export function cloudUpgradeSelect(place: string, upgrade: string) {
	console.log('cloudUpgradeSelect', place, upgrade)
	return set(ref(database, `things/${place}/now/request/upgradeOption`), upgrade)
}

function cloudSetUpgradeState(place: string, state: string | null) {
	console.log('cloudSetUpgradeState', place, state)
	return set(ref(database, `things/${place}/now/request/upgradeState`), state)
}

export function cloudUpgradeStart(place: string) {
	return cloudSetUpgradeState(place, 'download')
}

export function cloudUpgradeStop(place: string) {
	return cloudSetUpgradeState(place, null)
}

export function cloudSetFileSync(place: string, want: boolean): Promise<void> {
	console.log('cloudSetFileSync', place, want)
	return set(ref(database, `things/${place}/now/request/fileSync`), want)
}

export function cloudSetOauthTN(place: string, want: boolean): Promise<void> {
	console.log('cloudSetOauthTN', place, want)
	return set(ref(database, `things/${place}/now/request/oauthTN`), want)
}

export function cloudSetLogListSync(place: string, want: boolean): Promise<void> {
	console.log('cloudSetLogListSync', place, want)
	return set(ref(database, `things/${place}/now/request/logListSync`), want)
}

export function cloudClearFileSyncInfo(place: string, fn: string): Promise<void> {
	console.log('cloudClearFileSyncInfo', place, fn)
	return set(ref(database, `things/${place}/now/request/file/${fn}`), null)
}
