/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021, 2022 Aleksander Mazur
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

import { TThingType,
	IThingsListener,
	IBaseNamedThingsWithAlias, IBaseNamedThingWithAlias,
	IVariables, IVariable,
	VAR_SYNC_PREFIX,
} from './Things'
import { LocalThingsProvider } from './local/Things'
import { CloudThingsProvider } from './cloud/Things'
import { API1ThingsProvider } from './api1/Things'
import { ISystemInfoListener } from './System'
import { LocalSystemInfoProvider } from './local/System'
import { IAudiosListener } from './Audio'
import { LocalAudiosProvider } from './local/Audio'
import { IVideo } from './Video'
import { localVideosRegisterListener, localVideosUnregisterListener,
	getLocalVideoTNURL, getLocalVideoURL } from './local/Videos'
import {
	cloudVideosRegisterListener, cloudVideosUnregisterListener,
	cloudNewestVideosRegisterListener, cloudNewestVideosUnregisterListener,
	getCloudVideoTNURL, cloudOrderVideo, cloudOrderVideoTNUpTo } from './cloud/Videos'
import { LocalErrorMessage } from './local/Client'
import { localSwitchDevice, localRenameThing, localRemoveThing, localSendUSSD, localSendSMS } from './local/Operations'
import {
	cloudSwitchDevice,
	cloudSetThingColor,
	cloudWakeUp,
	cloudSendUSSD,
	cloudSendSMS,
	cloudOrderGeneric,
	cloudRenameThing,
	cloudRemoveThing,
} from './cloud/Operations'
import { LocalQueryTermos, LocalPostTermos } from './local/Termos'
import { CloudQueryTermos, CloudPostTermos } from './cloud/Termos'
import { ThingType, THistoryListener } from './History'
import {
	cloudHistoryRegisterListener,
	cloudHistoryRegisterListenerNewest,
	cloudHistoryRegisterOldestEntryListener,
	cloudHistoryUnregisterListener,
	cloudHistoryDeleteEntry,
	cloudHistoryDeleteEntriesOlderThan,
} from './cloud/History'
import {
	api1HistoryRegisterListener,
	api1HistoryRegisterListenerNewest,
	api1HistoryUnregisterListener,
} from './api1/History'
import { IYUVFrame, ICameraConfig } from './Camera'
import { LocalQueryCameraFrame,  LocalQueryCameraConfig, LocalQueryCameraMask } from './local/Camera'
import { CloudQueryCameraConfig, CloudQueryCameraMask } from './cloud/Camera'
import {
	cloudLogsRegisterListener, cloudLogsUnregisterListener,
	cloudOrderLog, cloudLogsForceSync,
} from './cloud/Logs'
import {
	localLogsRegisterListener, localLogsUnregisterListener,
} from './local/Logs'
import { getCloudSyncVarURL } from './cloud/SyncVars'

/*------------------------------------*/

export type DataStatus = 'unknown' | 'auth' | 'working' | 'ok' | 'timeout' | 'error'

export interface IDataListener {
	statusChanged: (status: DataStatus, message?: string) => void
}

export interface IDataProvider {
	start: () => void
	stop: () => void
}

declare const VARIANT: string

function newOperationUnsupported() {
	return new Error('Operacja nieobsługiwana')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OperationUnsupported(): Promise<any> {
	return Promise.reject(newOperationUnsupported())
}

/** A potentially cached URL. */
export interface ICachedURL {
	/** The URL itself. */
	url: string
	/**
	 * Whether the [[url]] comes from the cache (true) or not (false).
	 *
	 * If true, it might make sense to try once more with increased tryIdx.
	 */
	cached: boolean
}

/*------------------------------------*/

export function createThingsProvider(listener: IThingsListener): IDataProvider | undefined {
	if (VARIANT === 'local')
		return new LocalThingsProvider(listener)
	if (VARIANT === 'cloud')
		return new CloudThingsProvider(listener)
	if (VARIANT === 'api1')
		return new API1ThingsProvider(listener)
}

/*------------------------------------*/

export function createSystemInfoProvider(listener: ISystemInfoListener): IDataProvider | undefined {
	if (VARIANT === 'local')
		return new LocalSystemInfoProvider(listener)
}

/*------------------------------------*/

export function createAudiosProvider(listener: IAudiosListener): IDataProvider | undefined {
	if (VARIANT === 'local')
		return new LocalAudiosProvider(listener)
}

/*------------------------------------*/

export type TVideosListener = (place: string, videos: IVideo[]) => void

export function VideosRegisterListener(place: string, min: number, max: number, listener: TVideosListener) {
	if (min > max)
		throw new Error('Invalid range: ' + min + ' > ' + max)
	if (VARIANT === 'local')
		return localVideosRegisterListener(place, min, max, listener)
	if (VARIANT === 'cloud')
		return cloudVideosRegisterListener(place, min, max, listener)
	throw newOperationUnsupported()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VideosUnregisterListener(query: any) {
	if (VARIANT === 'local')
		return localVideosUnregisterListener(query)
	if (VARIANT === 'cloud')
		return cloudVideosUnregisterListener(query)
	throw newOperationUnsupported()
}

export function NewestVideosRegisterListener(place: string, limit: number, listener: TVideosListener) {
	if (VARIANT === 'cloud')
		return cloudNewestVideosRegisterListener(place, limit, listener)
	throw newOperationUnsupported()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NewestVideosUnregisterListener(query: any) {
	if (VARIANT === 'cloud')
		return cloudNewestVideosUnregisterListener(query)
	throw newOperationUnsupported()
}

/*------------------------------------*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ErrorMessage(e: any): string {
	let result = ''
	if (VARIANT === 'local')
		result = LocalErrorMessage(e)
	if (!result)
		result = !e ? '' : typeof e.message === 'string' ? e.message : e.toString()
	return result
}

/*------------------------------------*/

export function OperationSwitchDevice(place: string, id: string, want: boolean | null): Promise<void> {
	if (VARIANT === 'local' && typeof want === 'boolean')
		return localSwitchDevice(place, id, want)
	if (VARIANT === 'cloud')
		return cloudSwitchDevice(place, id, want)
	return OperationUnsupported()
}

export function OperationRenameThing(place: string, type: TThingType, id: string, alias: string): Promise<void> {
	if (VARIANT === 'local')
		return localRenameThing(place, type, id, alias)
	if (VARIANT === 'cloud')
		return cloudRenameThing(place, type, id, alias)
	return OperationUnsupported()
}

export function OperationRemoveThing(place: string, type: TThingType, id: string): Promise<void> {
	if (VARIANT === 'local')
		return localRemoveThing(place, type, id)
	if (VARIANT === 'cloud')
		return cloudRemoveThing(place, type, id)
	return OperationUnsupported()
}

export function OperationSetThingColor(place: string, type: TThingType, id: string, color: string | null): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudSetThingColor(place, type, id, color)
	return OperationUnsupported()
}

/*------------------------------------*/

function transformPropertyIDs<T extends object>(object: { [id: string]: T }, field: string): { [id: string]: T } {
	const result: { [id: string]: T } = {}
	for (const id in object) {
		const property: T = object[id]
		if (typeof property !== 'object')
			throw new Error('Nieprawidłowa wartość pod ' + id)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const key = (property as any)[field]
		if (typeof key === 'undefined')
			continue
		if (typeof key !== 'string')
			throw new Error('Nieprawidłowa wartość pola ' + field + ' pod ' + id)
		result[key] = property
	}
	return result
}

/**
 * Transforms given variables so that the resulting object
 * has keys equal to variables[id].key (keys becomes ids).
 */
export function getVariablesIndexedByKey(variables: IVariables | null | undefined): IVariables {
	if (!variables)
		return {}
	if (VARIANT === 'local')	// nothing to do, local provider uses no other keys
		return variables
	if (VARIANT === 'cloud')
		return transformPropertyIDs<IVariable>(variables, 'key')
	throw new Error(VARIANT)
}

/**
 * Transforms given devices so that the resulting object
 * has keys equal to devices[id].name (names become ids).
 */
export function getThingsIndexedByName(things: IBaseNamedThingsWithAlias | null | undefined)
	: IBaseNamedThingsWithAlias {

	if (!things)
		return {}
	if (VARIANT === 'local')	// nothing to do, local provider uses no other names
		return things
	if (VARIANT === 'cloud')
		return transformPropertyIDs<IBaseNamedThingWithAlias>(things, 'name')
	throw new Error(VARIANT)
}

export function getVariableIDByKey(variables: IVariables | null | undefined, key: string): string | undefined {
	if (!variables)
		return undefined
	if (VARIANT === 'local')	// nothing to do, local provider uses no other keys
		return key
	if (VARIANT === 'cloud') {
		for (const id in variables)
			if (variables[id].key === key)
				return id
		return undefined
	}
	throw new Error(VARIANT)
}

/*------------------------------------*/

export function getVideoTNURL(place: string, no: number, frame: number): string {
	if (VARIANT === 'local')
		return getLocalVideoTNURL(no, frame)
	if (VARIANT === 'cloud')
		return getCloudVideoTNURL(place, no, frame)
	return ''
}

export function getVideoURL(place: string, no: number, ext: string): string {
	if (VARIANT === 'local')
		return getLocalVideoURL(no, ext)
	return ''
}

/**
 * Orders or cancels order for a video.
 *
 * Expected result of the order is that the system at given place
 * sends the video directly to user's e-mail.
 *
 * @param place Place which holds the video.
 * @param no Number of the video.
 * @param order true if the video should be ordered, false if the order should be cancelled.
 * @return A promise to order a video or cancel the order.
 */
export function orderVideo(place: string, no: number, order: boolean): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudOrderVideo(place, no, order)
	return OperationUnsupported()
}

/**
 * Orders or cancels order for subsequent thumbnails of particular video.
 *
 * Expected result of the order is that the system at given place
 * uploads frames (thumbnails) beyond "hasTN" up to and including given "wantTN".
 *
 * @param place Place which holds the video.
 * @param no Number of the video.
 * @param wantTN Maximum index of frame (thumbnail) which should be made available,
 * or undefined if uploading subsequent thumbnails should be cancelled.
 * @return A promise to order subsequent thumbnails or cancel the order.
 */
export function orderVideoTNUpTo(place: string, no: number, wantTN?: number): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudOrderVideoTNUpTo(place, no, wantTN)
	return OperationUnsupported()
}

/*------------------------------------*/

/**
 * Wakes up client/terminal at a place associated with given wake up session.
 *
 * @param session Wake up session = value of things.request.wakeup property
 *                passed to IThingsListener.thingsChanged.
 */
export function wakeup(session: string): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudWakeUp(session)
	return OperationUnsupported()
}

/*------------------------------------*/

export function queryTermos(place: string, cksum: string): Promise<ArrayBuffer> {
	if (VARIANT === 'local')
		return LocalQueryTermos()
	if (VARIANT === 'cloud')
		return CloudQueryTermos(place, cksum)
	return OperationUnsupported()
}

export function postTermos(place: string, variableID: string, data: ArrayBuffer): Promise<void> {
	if (VARIANT === 'local')
		return LocalPostTermos(data)
	if (VARIANT === 'cloud')
		return CloudPostTermos(place, variableID, data)
	return OperationUnsupported()
}

/*------------------------------------*/

export function historyRegisterListener(
	place: string,
	type: ThingType,
	id: string,
	tsMin: number,
	tsMax: number,
	cb: THistoryListener) {

	if (VARIANT === 'cloud')
		return cloudHistoryRegisterListener(place, type, id, tsMin, tsMax, cb)
	if (VARIANT === 'api1')
		return api1HistoryRegisterListener(place, type, id, tsMin, tsMax, cb)
	throw newOperationUnsupported()
}

export function historyRegisterListenerNewest(
	place: string,
	type: ThingType,
	id: string,
	cntMax: number,
	cb: THistoryListener) {

	if (VARIANT === 'cloud')
		return cloudHistoryRegisterListenerNewest(place, type, id, cntMax, cb)
	if (VARIANT === 'api1')
		return api1HistoryRegisterListenerNewest(place, type, id, cntMax, cb)
	throw newOperationUnsupported()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function historyUnregisterListener(query: any): void {
	if (VARIANT === 'cloud')
		return cloudHistoryUnregisterListener(query)
	if (VARIANT === 'api1')
		return api1HistoryUnregisterListener(query)
	throw newOperationUnsupported()
}

export function historyRegisterOldestEntryListener(
	place: string,
	type: ThingType,
	id: string,
	cb: THistoryListener) {

	if (VARIANT === 'cloud')
		return cloudHistoryRegisterOldestEntryListener(place, type, id, cb)
	throw newOperationUnsupported()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function historyUnregisterOldestEntryListener(query: any): void {
	if (VARIANT === 'cloud')
		return cloudHistoryUnregisterListener(query)
	throw newOperationUnsupported()
}

export function historyDeleteEntry(
	place: string,
	type: ThingType,
	id: string,
	ts: number): Promise<void> {

	if (VARIANT === 'cloud')
		return cloudHistoryDeleteEntry(place, type, id, ts)
	return OperationUnsupported()
}

export function historyDeleteEntriesOlderThan(
	place: string,
	type: ThingType,
	id: string,
	tsMax: number): Promise<boolean> {

	if (VARIANT === 'cloud')
		return cloudHistoryDeleteEntriesOlderThan(place, type, id, tsMax)
	return OperationUnsupported()
}

/*------------------------------------*/

export function sendUSSD(place: string, ussd: string): Promise<void> {
	if (VARIANT === 'local')
		return localSendUSSD(ussd)
	if (VARIANT === 'cloud')
		return cloudSendUSSD(place, ussd)
	return OperationUnsupported()
}

export function sendSMS(place: string, to: string, content: string): Promise<void> {
	if (VARIANT === 'local')
		return localSendSMS(to, content)
	if (VARIANT === 'cloud')
		return cloudSendSMS(place, to, content)
	return OperationUnsupported()
}

export function cancelOrderUSSDorSMS(place: string, what: 'ussd' | 'sms'): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudOrderGeneric(place, what, false)
	return OperationUnsupported()
}

/*------------------------------------*/

export function QueryCameraFrame(place: string, id: string): Promise<IYUVFrame> {
	if (VARIANT === 'local')
		return LocalQueryCameraFrame(id)
	return OperationUnsupported()
}

export function QueryCameraConfig(place: string, id: string, cksum: string): Promise<ICameraConfig> {
	if (VARIANT === 'local')
		return LocalQueryCameraConfig(id)
	if (VARIANT === 'cloud')
		return CloudQueryCameraConfig(place, id, cksum)
	return OperationUnsupported()
}

export function QueryCameraMask(place: string, id: string, cksum: string): Promise<ArrayBuffer> {
	if (VARIANT === 'local')
		return LocalQueryCameraMask(id)
	if (VARIANT === 'cloud')
		return CloudQueryCameraMask(place, id, cksum)
	return OperationUnsupported()
}

/*------------------------------------*/

export interface ILogFile {
	name: string
	size: number
	desc?: string
	order?: boolean
}

export type TLogsListener = (place: string, logs: ILogFile[]) => void

export function LogsRegisterListener(place: string, listener: TLogsListener) {
	if (VARIANT === 'local')
		return localLogsRegisterListener(place, listener)
	if (VARIANT === 'cloud')
		return cloudLogsRegisterListener(place, listener)
	throw newOperationUnsupported()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LogsUnregisterListener(query: any) {
	if (VARIANT === 'local')
		return localLogsUnregisterListener(query)
	if (VARIANT === 'cloud')
		return cloudLogsUnregisterListener(query)
	throw newOperationUnsupported()
}

export function orderLog(place: string, name: string, order: boolean): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudOrderLog(place, name, order)
	return OperationUnsupported()
}

export function LogsForceSync(place: string): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudLogsForceSync(place)
	return OperationUnsupported()
}

/*------------------------------------*/

export function getSyncVarURL(place: string, name: string, value: string): string {
	if (!name.startsWith(VAR_SYNC_PREFIX))
		return ''
	const sub = name.substring(VAR_SYNC_PREFIX.length)
	if (VARIANT === 'local')
		return sub
	if (VARIANT === 'cloud')
		return getCloudSyncVarURL(place, sub, value)
	return ''
}

/*------------------------------------*/
