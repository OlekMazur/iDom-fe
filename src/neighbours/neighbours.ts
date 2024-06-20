/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2021, 2022, 2024 Aleksander Mazur
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

import { IThingIDByPlace, INeighbour, IPlacesThings, IPermissions } from '../data/Things'
import { IDeviceHistoryEntry } from '../data/History'
import { getNeighbourIcon } from '../style'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'

/**************************************/

interface INeighbourProp {
	ts: number
	value: string
}

interface INeighbourProps {
	[name: string]: INeighbourProp
}

export interface INeighbourDevice {
	idAt: IThingIDByPlace
	props: INeighbourProps
	thing: INeighbour
	place: string
	alias?: string	// alias of the place
	id: string
	baseTS: number
	icon: IconDefinition
	permissions?: IPermissions
}

export interface INeighbourDevices {
	[name: string]: INeighbourDevice
}

export interface INeighbourHistoryEntry extends IDeviceHistoryEntry {
	place: string
}

interface IExcludedTypes {
	[type: string]: boolean
}

/**************************************/

function neighbourUpdate(
	nd: INeighbourDevice,
	place: string,
	alias: string | undefined,
	id: string,
	thing: INeighbour,
	baseTS: number,
	permissions?: IPermissions,
): void {
	nd.idAt[place] = id

	if (nd.thing.ts < thing.ts) {
		nd.place = place
		nd.alias = alias
		nd.id = id
		nd.thing = thing
		nd.baseTS = baseTS
		nd.permissions = permissions
	}

	for (const meta of thing.info.split(';')) {
		const split = meta.indexOf('=')
		const name = meta.slice(0, split)
		if (!nd.props[name] || nd.props[name].ts < thing.ts)
			nd.props[name] = {
				ts: thing.ts,
				value: meta.slice(split + 1),
			}
	}
}

function neighbourCmp(a: INeighbourDevice, b: INeighbourDevice) {
	return b.thing.ts - a.thing.ts
}

function getNeighboursFrom(
	result: INeighbourDevices,
	placesThings: IPlacesThings,
	place: string,
	excludedTypes?: IExcludedTypes,
): void {
	const things = placesThings[place]
	if (!things || !things.neighbours)
		return
	const alias = placesThings[place]?.alias
	for (const id in things.neighbours) {
		const thing = things.neighbours[id]
		const name = thing.name
		if (!name)
			continue
		if (excludedTypes) {
			const type = name.split('/', 1)[0]
			if (excludedTypes[type])
				continue
		}
		if (!result[name])
			result[name] = {
				props: {},
				idAt: {},
				thing,
				place,
				alias,
				id,
				baseTS: things.ts,
				icon: getNeighbourIcon(thing),
				permissions: things.permissions,
			}
		neighbourUpdate(result[name], place, alias, id, thing, things.ts, things.permissions)
	}
}

export function getNeighbours(
	placesThings: IPlacesThings,
	limit?: number,
	places?: string[],
	excludedTypes?: IExcludedTypes,
): INeighbourDevice[] {
	const result: INeighbourDevices = {}
	if (places)
		for (const place of places)
			getNeighboursFrom(result, placesThings, place, excludedTypes)
	else
		for (const place in placesThings)
			getNeighboursFrom(result, placesThings, place, excludedTypes)
	const array = Object.values(result).sort(neighbourCmp)
	if (limit !== undefined)
		array.splice(limit)
	return array
}

export function neighbourConvertHistory(place: string, history: IDeviceHistoryEntry[]): INeighbourHistoryEntry[] {
	for (const entry of history)
		(entry as INeighbourHistoryEntry).place = place
	return history as INeighbourHistoryEntry[]
}

function neighbourHistoryCmp(a: INeighbourHistoryEntry, b: INeighbourHistoryEntry) {
	return b.ts - a.ts
}

export function neighbourCombineHistory(parts: INeighbourHistoryEntry[][]): INeighbourHistoryEntry[] {
	const result: INeighbourHistoryEntry[] = []
	for (const part of parts)
		Array.prototype.push.apply(result, part)
	result.sort(neighbourHistoryCmp)
	return result
}

/**************************************/
