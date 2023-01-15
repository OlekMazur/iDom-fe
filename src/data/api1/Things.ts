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

import { IDataProvider, ErrorMessage } from '../API'
import { IThings, IThingsListener, ISensor, IDevice, IVariable, INeighbour } from '../Things'
import { QueryGet, CheckResponse } from '../Client'

/*------------------------------------*/

interface IRawThings {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[id: string]: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IRawThingsMapper = (id: string, data: any) => any

function mapThings(input: IRawThings | undefined, cb: IRawThingsMapper): IRawThings {
	const result: IRawThings = {}
	if (input)
		for (const id in input)
			if (typeof(input[id]) === 'object')
				result[id] = cb(id, input[id])
	return result
}

/*------------------------------------*/

const mapSensor = (id: string, data: IRawThings): ISensor => ({
	ts: data.ts,
	name: id,
	alias: data.name,
	value: data.value || 0,
	unit: data.unit || '',
	color: data.rgb,
})

const mapDevice = (id: string, data: IRawThings): IDevice => ({
	ts: data.ts,
	name: id,
	alias: data.name,
	state: !!data.state,
	color: data.rgb,
})

const mapNeighbour = (id: string, data: IRawThings): INeighbour => ({
	ts: data.ts,
	name: data.string_id || id,
	info: data.info,
	alias: data.name,
	state: !!data.state,
})

const mapVariable = (id: string, data: IRawThings): IVariable => ({
	ts: data.ts,
	key: data.name,
	value: data.alias,
})

/*------------------------------------*/

interface IRawSession {
	last_io: number
	offset: number
	ip: string
	last_ip_change: number
}

interface IRawSessions {
	[id: string]: IRawSession
}

function findMaxLastIO(sessions?: IRawSessions): number {
	let maxLastIO = 0
	if (sessions)
		for (const id in sessions) {
			const lastIO = sessions[id].last_io
			if (maxLastIO < lastIO)
				maxLastIO = lastIO
		}
	return maxLastIO
}

/*------------------------------------*/

export class API1ThingsProvider implements IDataProvider {
	constructor(protected thingsListener: IThingsListener) { }

	public start() {
		this.thingsListener.statusChanged('working')
		QueryGet('js_list.php')
		.then((response) => {
			CheckResponse(response, 'application/json')
			return response.json()
		}).then((things) => {
			const result = this.processThings(things)
			this.thingsListener.statusChanged(result ? 'ok' : 'error')
		}).catch((e) => {
			console.error(e)
			this.thingsListener.statusChanged('error', ErrorMessage(e))
		})
	}

	public stop() {	// tslint:disable-line:no-empty
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private processThings(things: any): boolean {
		if (typeof things !== 'object')
			return false
		if (typeof things.places !== 'object')
			return false

		const ts = Date.now() / 1000
		for (const id of Object.keys(things.places)) {
			const place = things.places[id]
			if (!place.sensors && !place.devices && !place.variables)
				continue
			const lastIO = findMaxLastIO(place.sessions)
			this.thingsListener.placeAdded(place.name)
			const result: IThings = {
				ts: lastIO || ts,
				sensors: mapThings(place.sensors, mapSensor),
				devices: mapThings(place.devices, mapDevice),
				variables: mapThings(place.variables, mapVariable),
				neighbours: mapThings(place.neighbours, mapNeighbour),
				messages: [],
			}
			this.thingsListener.thingsChanged(place.name, result)
		}

		return true
	}
}

/*------------------------------------*/
