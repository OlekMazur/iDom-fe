/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021, 2022, 2024 Aleksander Mazur
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

import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { IDataListener } from './Provider'
import { getThingsIndexedByName } from './API'
import { orderByNameAsc, orderByUnitImportance } from '../sort'

/*------------------------------------*/

export interface IBaseThing {
	ts: number
}

export interface IBaseNamedThing extends IBaseThing {
	name?: string
}

export interface IBaseNamedThings {
	[id: string]: IBaseNamedThing
}

export interface IBaseNamedThingWithAlias extends IBaseNamedThing {
	alias?: string
}

export interface IBaseNamedThingsWithAlias {
	[id: string]: IBaseNamedThingWithAlias
}

/*------------------------------------*/

export interface ISensor extends IBaseNamedThingWithAlias {
	value: number
	unit: string
	color?: string
}

export interface ISensors {
	[id: string]: ISensor
}

/*------------------------------------*/

export interface IDevice extends IBaseNamedThingWithAlias {
	state: boolean
	color?: string
	want?: boolean
}

export interface IDevices {
	[id: string]: IDevice
}

/*------------------------------------*/

export interface IVariable extends IBaseThing {
	key: string
	value: string
	want?: string
}

export interface IVariables {
	[id: string]: IVariable
}

export const VAR_SYNC_PREFIX = 'sync.'
export const TERMOSTAT_BIN = 'termostat.bin'
export const SYNC_TERMOSTAT_BIN = VAR_SYNC_PREFIX + TERMOSTAT_BIN

/*------------------------------------*/

export interface IMessage extends IBaseNamedThing {
	group: string
	ts: number
	from: string
	content: string
	copy: boolean
	sent: boolean
}

export type IMessages = IMessage[]

/*------------------------------------*/

export interface INeighbour extends IBaseNamedThingWithAlias {
	state: boolean
	info: string
}

export interface INeighbours {
	[id: string]: INeighbour
}

/*------------------------------------*/

export interface IPermissions {
	things?: boolean
	history?: boolean
	historyWrite?: boolean
	tn?: boolean
	wantTN?: boolean
	recListSync?: boolean
	video?: boolean
	order?: boolean
	device?: boolean
	variable?: boolean
	color?: boolean
	logs?: boolean
	logsSync?: boolean
	rename?: boolean
	remove?: boolean
	wakeup?: boolean
	upgrade?: boolean
	post?: {
		[cgi: string]: boolean
	}
}

/*------------------------------------*/

export interface IMappingID {
	[id: string]: string
}

export type TThingType = 'sensors' | 'devices' | 'variables' | 'neighbours'

export interface IThings {
	ts: number					/**< Base timestamp of the data dump. */
	tsSV?: number				/**< Timestamp of last contact with server (if applicable). */
	alias?: string				/**< Name of the place. */
	next?: number				/**< Value of "sys.next" variable. */
	sensors: ISensors
	devices: IDevices
	variables: IVariables
	varByKey?: IMappingID		/**< Mapping of variables[id].key to id. Can be undefined if the mapping is 1:1 (keys are IDs). */
	messages: IMessages
	neighbours: INeighbours
	permissions?: IPermissions
}

/*------------------------------------*/

export interface IThingsListener extends IDataListener {
	placeAdded: (place: string) => void
	placeRemoved: (place?: string) => void
	thingsChanged: (place: string, things: IThings) => void
}

/*------------------------------------*/

/**
 * Places and their things.
 *
 * `null' means that a place is known but things haven't been obtained yet.
 */
export interface IPlacesThings {
	[place: string]: IThings | null
}

export interface IThingIDByPlace {
	[place: string]: string
}

/** Things of the same name and their IDs at different places. */
export interface IThingsGroup {
	/** Name of the field selected for grouping things (e.g. "alias"). */
	name: string
	/** Icon of the group of things. */
	icon?: IconDefinition
	/**
	 * In case of sensors, unit of one of the sensors in the group used as sorting key.
	 * (Sensors of same alias and different units will share same group.)
	 */
	unit?: string
	/** An array of IDs at each place. */
	idAt: IThingIDByPlace
	/** Number of places inside @c idAt. */
	places: number
	/** If there is only one thing in the group, here the name of the only place is given. */
	single?: string
	/** Whether at least one of things refered by [[idAt]] is "important". */
	important: boolean
	/** Timestamp of the most recent thing in group. */
	ts: number
}

export type TThingsFilter = (thing: IBaseThing) => boolean

export type TIconGetter = (thing: IBaseThing) => IconDefinition

export function getPermittedPlaces(pt: IPlacesThings, permission: keyof IPermissions): string[] {
	const result: string[] = []
	for (const place in pt) {
		if (!pt[place])
			continue
		const things = pt[place]
		if (!things || (things.permissions && !things.permissions[permission]))
			continue
		result.push(place)
	}
	return result
}

/*------------------------------------*/

function cmpThenByName(a: IThingsGroup, b: IThingsGroup, result: number): number {
	if (result)
		return result
	return orderByNameAsc(a.name, b.name)
}

function cmpGroupsByUnitThenName(a: IThingsGroup, b: IThingsGroup): number {
	return cmpThenByName(a, b, orderByUnitImportance(a.unit, b.unit))
}

function cmpGroupsByName(a: IThingsGroup, b: IThingsGroup): number {
	return orderByNameAsc(a.name, b.name)
}

function cmpGroupsByTSThenName(a: IThingsGroup, b: IThingsGroup): number {
	return cmpThenByName(a, b, b.ts - a.ts)
}

const groupsTypeComparator = {
	'sensors': cmpGroupsByUnitThenName,
	'devices': cmpGroupsByName,
	'variables': cmpGroupsByTSThenName,
	'neighbours': cmpGroupsByName,
}

/*------------------------------------*/

function getThingName(thingType: TThingType, thing: IBaseThing): string | undefined {
	switch (thingType) {
		case 'sensors':
		case 'devices':
		case 'neighbours': {
			const bntwa = thing as IBaseNamedThingWithAlias
			return bntwa.alias || bntwa.name
		}
		case 'variables':
			return (thing as IVariable).key
		default:
			return undefined
	}
}

interface IToIgnoreByPlace {
	[place: string]: IBaseNamedThingsWithAlias
}

function thingToBeIgnored(
	place: string, allThings: IThings, sd: IBaseNamedThingWithAlias,
	toIgnoreByPlace: IToIgnoreByPlace, toIgnore?: 'sensors' | 'devices'): boolean {

	if (toIgnore && !sd.alias && sd.name) {
		if (!toIgnoreByPlace[place])
			toIgnoreByPlace[place] = getThingsIndexedByName(allThings[toIgnore])
		const other = toIgnoreByPlace[place][sd.name]
		if (other && other.alias)
			return true
	}
	return false
}

interface IThingsGroups {
	[name: string]: IThingsGroup
}

function getThingGroup(
	name: string, thingType: TThingType, getIcon: TIconGetter | undefined,
	thing: IBaseThing, important: boolean,
	groups: IThingsGroups): IThingsGroup {
	let group = groups[name]
	if (!group) {
		group = groups[name] = {
			name,
			icon: getIcon && getIcon(thing),
			idAt: {},
			places: 0,
			important,
			ts: thing.ts,
		}
		if (thingType === 'sensors')
			group.unit = (thing as ISensor).unit
	} else {
		if (important)
			group.important = true
		if (group.ts < thing.ts)
			group.ts = thing.ts
	}
	return group
}

/**
 * Groups things of particular type from many places by name appropriate for the type
 * (alias of sensor/device or key of variable).
 *
 * @param pt Places and their things.
 * @param places Array of keys of @c pt which should be taken into account.
 * @param thingType Type of things to group.
 * @param getIcon Function used to assign value of the icon field of group of things.
 * It is assumed that icon of any thing is applicable to whole group.
 * @param toIgnore Type of things which share "name" property with things of type [[thingType]].
 * If found thing has no alias and there exists a thing of this type with same name
 * and non-empty alias, the found thing is completely ignored.
 * @param isImportant Optional callback which checks if given thing is "important".
 * If not given, all groups will get important = true.
 * @return Ordered array of groups of things by name.
 */
export function groupThingsByName(
	pt: IPlacesThings,
	places: string[],
	thingType: TThingType,
	getIcon?: TIconGetter,
	toIgnore?: 'sensors' | 'devices',
	isImportant?: TThingsFilter,
): IThingsGroup[] {
	const groups: IThingsGroups = {}
	const toIgnoreByPlace: IToIgnoreByPlace = {}

	for (const place of places) {
		const allThings = pt[place]
		if (!allThings)
			continue
		const things = allThings[thingType]
		for (const id in things) {
			const thing = things[id]
			const name = getThingName(thingType, thing)
			if (name === undefined)
				continue
			if (thingToBeIgnored(place, allThings, thing, toIgnoreByPlace, toIgnore))
				continue
			const important = !isImportant || isImportant(thing)
			const group = getThingGroup(name, thingType, getIcon, thing, important, groups)
			if (!group.idAt[place]) {
				group.single = group.places ? undefined : place
				group.places++
			}
			group.idAt[place] = id
		}
	}

	const result = Object.values(groups)
	result.sort(groupsTypeComparator[thingType])
	return result
}

/*------------------------------------*/

/** Array of prefixes of sensor/device names which belong to the "thermostate" group. */
const TERMOSTAT = [
	'ow',
	'T',
]

export function isSensorTermostat(sensor: ISensor) {
	return sensor.name && TERMOSTAT.includes(sensor.name.split('/', 1)[0])
}

export function isSensorNotTermostat(sensor: ISensor) {
	return !isSensorTermostat(sensor)
}

export function isDeviceTermostat(device: IDevice) {
	if (!device.name)
		return false
	if (device.name[0] === '#')
		return true
	const group = device.name.split('/', 1)[0]
	return (group === 'termostat' && !device.state) || TERMOSTAT.includes(group)
}

export function isDeviceOther(device: IDevice) {
	if (!device.name)
		return true
	if (device.name[0] === '#')
		return false
	const group = device.name.split('/', 1)[0]
	return !TERMOSTAT.includes(group)
}

/*------------------------------------*/

/** Artificial global thing ID parsed into pieces. */
export interface IGlobalThingID {
	/** Place where thing belongs. */
	place: string
	/** Place-specific ID of the thing. */
	id: string
}

/**
 * Parses artificial global thing ID (returned from [[getAllThingsIDs]]) into pieces.
 *
 * @param globalID Entry of an array returned from [[getAllThingsIDs]].
 * @return Parsed global thing ID.
 */
export function parseGlobalThingID(globalID: string): IGlobalThingID {
	const parts = globalID.split('.', 2)
	if (parts.length !== 2)
		throw new Error('Nieprawidłowy identyfikator globalny: ' + globalID)
	return {
		place: parts[0],
		id: parts[1],
	}
}

/**
 * Builds artificial global thing ID for using as property key.
 *
 * @param parts Parsed global thing ID.
 * @return Single string with artificial global thing ID.
 */
export function buildGlobalThingID(parts: IGlobalThingID): string {
	return parts.place + '.' + parts.id
}

/**
 * Converts array of grouped things (returned from [[groupThingsByName]])
 * into flat array of IDs created by concatenating places with
 * place-specific thing IDs.
 *
 * @param groups Result of [[groupThingsByName]].
 * @param important Ignore groups having different value of "important" than given one.
 * If undefined, groups aren't filtered.
 * @return Flat array of artificial global thing IDs.
 */
export function getAllThingsIDs(groups: IThingsGroup[], important: boolean): string[] {
	const result: string[] = []
	for (const group of groups)
		if (important === undefined || important === group.important)
			for (const place in group.idAt)
				result.push(buildGlobalThingID({
					place,
					id: group.idAt[place],
				}))
	//console.log('getAllThingsIDs', groups, result)
	return result
}

/*------------------------------------*/

export interface ITermosMapping {
	/** Alias or name of each sensor. The keys are appropriate for termos data (12 hex chars). */
	sensors: {
		[key: string]: ISensor,
	},
	/** Alias or name of each of 8 possible relays (length=8). */
	relays: IDevice[]
}

export function getTermosMapping(things: IThings): ITermosMapping {
	const result: ITermosMapping = {
		sensors: {},
		relays: [],
	}
	for (const id in things.devices) {
		const device = things.devices[id]
		if (!device.name || device.name.length !== 2 || device.name[0] !== '#')
			continue
		const index = parseInt(device.name.substring(1), 10)
		if (isNaN(index) || index < 0 || index >= 8)
			continue
		result.relays[index] = device
	}
	for (const id in things.sensors) {
		const sensor = things.sensors[id]
		if (!sensor.name || sensor.name.length !== 18 || !sensor.name.startsWith('ow/') || sensor.name[5] !== '.')
			continue
		const hex = sensor.name.substring(6)
		if (!/^[0-9A-F]{12}$/.test(hex))
			continue
		result.sensors[hex] = sensor
	}
	return result
}

export function describeRelay(mapping: ITermosMapping | undefined, index: number): string {
	const device = mapping && mapping.relays[index]
	if (device) {
		if (device.alias)
			return device.alias
		if (device.name)
			return device.name
	}
	return '#' + index
}

export function describeSensor(mapping: ITermosMapping | undefined, id: string): string {
	const sensor = mapping && mapping.sensors[id]
	if (sensor) {
		if (sensor.alias)
			return sensor.alias
		if (sensor.name)
			return sensor.name
	}
	return id
}

/*------------------------------------*/

export function getVariableIDByKey(key: string, things?: IThings): string | undefined {
	return things ? (things.varByKey ? things.varByKey[key] : key) : undefined
}

export function getVariableByKey(key: string, things?: IThings): IVariable | undefined {
	const id = getVariableIDByKey(key, things)
	return id && things?.variables[id] || undefined
}

/**
 * Can be used to create IThings.varByKey from IThings.variables in most generic way.
 */
export function generateVarByKey(variables?: IVariables): IMappingID {
	const result: IMappingID = {}
	if (variables)
		for (const id of Object.keys(variables))
			if (variables[id].key)
				result[variables[id].key] = id
	return result
}

/*------------------------------------*/
