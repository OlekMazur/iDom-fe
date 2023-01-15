/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019 Aleksander Mazur
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

import { QueryPost, ExpectResponseEmpty } from '../Client'
import { TThingType } from '../Things'

const thingTypeXlat: { [type: string]: string } = {
	sensors: 'S',
	devices: 'D',
	neighbours: 'N',
	variables: 'V',
}

// on local system id=name

export function localSwitchDevice(place: string, name: string, want: boolean): Promise<void> {
	return QueryPost('/cgi-bin/termostat-switch', {
		type: thingTypeXlat.devices,
		name,
		value: want ? '1' : '0',
	}).then(ExpectResponseEmpty)
}

export function localRenameThing(place: string, type: TThingType, name: string, alias: string): Promise<void> {
	return QueryPost('/cgi-bin/termostat-rename', {
		type: thingTypeXlat[type],
		name,
		alias,
	}).then(ExpectResponseEmpty)
}

export function localRemoveThing(place: string, type: TThingType, name: string): Promise<void> {
	return QueryPost('/cgi-bin/termostat-remove', {
		type: thingTypeXlat[type],
		name,
	}).then(ExpectResponseEmpty)
}

export function localDeleteMessage(place: string, ts: number, group: string, id: string, from: string): Promise<void> {
	return QueryPost('/cgi-bin/msg-delete', {
		ts: '' + ts,
		group,
		id,
		from,
	}).then(ExpectResponseEmpty)
}

export function localSendUSSD(ussd: string): Promise<void> {
	return QueryPost('/cgi-bin/ussd', {
		ussd,
	}).then(ExpectResponseEmpty)
}

export function localSendSMS(to: string, content: string): Promise<void> {
	return QueryPost('/cgi-bin/sms', {
		to,
		content,
	}).then(ExpectResponseEmpty)
}
