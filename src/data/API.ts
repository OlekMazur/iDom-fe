/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021, 2022, 2023, 2024 Aleksander Mazur
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
	VAR_SYNC_PREFIX,
} from './Things'
import { IDataProvider } from './Provider'
import { LocalThingsProvider } from './local/Things'
import { CloudThingsProvider } from './cloud/Things'
import { API1ThingsProvider } from './api1/Things'
import { ISystemInfoListener } from './System'
import { LocalSystemInfoProvider } from './local/System'
import { IAudiosListener } from './Audio'
import { LocalAudiosProvider } from './local/Audio'
import { IVideo } from './Video'
import { localVideosRegisterListener, localVideosUnregisterListener,
	getLocalVideoTNURL, getLocalVideoURL,
} from './local/Videos'
import {
	cloudVideosRegisterListener, cloudVideosUnregisterListener,
	cloudNewestVideosRegisterListener, cloudNewestVideosUnregisterListener,
	getCloudVideoTNURL, cloudOrderVideo, cloudOrderVideoTNUpTo,
} from './cloud/Videos'
import {
	api1VideosRegisterListener, api1VideosUnregisterListener,
	api1NewestVideosRegisterListener, api1NewestVideosUnregisterListener,
	getApi1VideoTNURL, api1OrderVideo, api1OrderVideoTNUpTo,
} from './api1/Videos'
import { LocalErrorMessage } from './local/Client'
import {
	localSwitchDevice, localRenameThing, localRemoveThing,
	localSendUSSD, localSendSMS, localPurgeMessages,
} from './local/Operations'
import {
	cloudSwitchDevice, cloudRenameThing, cloudSetThingColor, cloudWakeUp,
	cloudSendUSSD, cloudSendSMS, cloudPurgeMessages,
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

declare const VARIANT: string

function newOperationUnsupported() {
	return new Error('Operacja nieobsługiwana')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OperationUnsupported(): Promise<any> {
	return Promise.reject(newOperationUnsupported())
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
	if (VARIANT === 'api1')
		return api1VideosRegisterListener(place, min, max, listener)
	throw newOperationUnsupported()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VideosUnregisterListener(query: any) {
	if (VARIANT === 'local')
		return localVideosUnregisterListener(query)
	if (VARIANT === 'cloud')
		return cloudVideosUnregisterListener(query)
	if (VARIANT === 'api1')
		return api1VideosUnregisterListener(query)
	throw newOperationUnsupported()
}

export function NewestVideosRegisterListener(place: string, limit: number, listener: TVideosListener) {
	if (VARIANT === 'cloud')
		return cloudNewestVideosRegisterListener(place, limit, listener)
	if (VARIANT === 'api1')
		return api1NewestVideosRegisterListener(place, limit, listener)
	throw newOperationUnsupported()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function NewestVideosUnregisterListener(query: any) {
	if (VARIANT === 'cloud')
		return cloudNewestVideosUnregisterListener(query)
	if (VARIANT === 'api1')
		return api1NewestVideosUnregisterListener(query)
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
 * Transforms given devices so that the resulting object
 * has keys equal to devices[id].name (names become ids).
 */
export function getThingsIndexedByName(things: IBaseNamedThingsWithAlias | null | undefined)
	: IBaseNamedThingsWithAlias {

	if (!things)
		return {}
	if (VARIANT === 'local')	// nothing to do, local provider uses no other names
		return things
	else
		return transformPropertyIDs<IBaseNamedThingWithAlias>(things, 'name')
}

/*------------------------------------*/

export function getVideoTNURL(place: string, no: number, frame: number): string {
	if (VARIANT === 'local')
		return getLocalVideoTNURL(no, frame)
	if (VARIANT === 'cloud')
		return getCloudVideoTNURL(place, no, frame)
	if (VARIANT === 'api1')
		return getApi1VideoTNURL(place, no, frame)
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
 * @param video Video to order.
 * @param order true if the video should be ordered, false if the order should be cancelled.
 * @return A promise to order a video or cancel the order.
 */
export function orderVideo(place: string, video: IVideo, order: boolean): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudOrderVideo(place, video, order)
	if (VARIANT === 'api1')
		return api1OrderVideo(place, video, order)
	return OperationUnsupported()
}

/**
 * Orders or cancels order for subsequent thumbnails of particular video.
 *
 * Expected result of the order is that the system at given place
 * uploads frames (thumbnails) beyond "hasTN" up to and including given "wantTN".
 *
 * @param place Place which holds the video.
 * @param video Video to order.
 * @param wantTN Maximum index of frame (thumbnail) which should be made available,
 * or undefined if uploading subsequent thumbnails should be cancelled.
 * @return A promise to order subsequent thumbnails or cancel the order.
 */
export function orderVideoTNUpTo(place: string, video: IVideo, wantTN?: number): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudOrderVideoTNUpTo(place, video, wantTN)
	if (VARIANT === 'api1')
		return api1OrderVideoTNUpTo(place, video, wantTN)
	return OperationUnsupported()
}

/*------------------------------------*/

/**
 * Wakes up client/terminal at a given place.
 *
 * @param up false cancels wake up order.
 */
export function wakeup(place: string): Promise<void> {
	if (VARIANT === 'cloud')
		return cloudWakeUp(place)
	return OperationUnsupported()
}

/*------------------------------------*/

export function queryTermos(place: string, cksum: string): Promise<ArrayBuffer> {
	if (VARIANT === 'local')
		return LocalQueryTermos(cksum)
	if (VARIANT === 'cloud')
		return CloudQueryTermos(place, cksum)
	return OperationUnsupported()
}

export function postTermos(place: string, variableID: string | undefined, data: ArrayBuffer): Promise<void> {
	if (VARIANT === 'local')
		return LocalPostTermos(data)
	if (VARIANT === 'cloud')
		return variableID ? CloudPostTermos(place, variableID, data) : Promise.reject('Najpierw terminal musi wgrać stary program')
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

export function purgeMessages(place: string, group: string): Promise<void> {
	if (VARIANT === 'local')
		return localPurgeMessages(group)
	if (VARIANT === 'cloud')
		return cloudPurgeMessages(place, group)
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

export type TLogsListener = (place: string, logs: ILogFile[], ts?: number) => void

export function LogsRegisterListener(place: string, listener: TLogsListener, limit?: number) {
	if (VARIANT === 'local')
		return localLogsRegisterListener(place, listener, limit)
	if (VARIANT === 'cloud')
		return cloudLogsRegisterListener(place, listener, limit)
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
