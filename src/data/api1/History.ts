/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019 Aleksander Mazur
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

import { IHistoryEntry, ThingType, THistoryListener } from '../History'
import { QueryGet, CheckResponse, IArgs } from '../Client'
import { strToInt, strToFloat } from '../../utils'

/*------------------------------------*/

interface IHistoryRequest {
	cb: THistoryListener
	place: string
	type: ThingType
	id: string
	tsMin?: number
	tsMax?: number
	cntMax?: number
	result: IHistoryEntry[]
	finished: boolean
}

interface IHistoryRequests {
	// rid = type + '.' + id
	[rid: string]: IHistoryRequest
}

const historyRequests: IHistoryRequests = {}
let historyTimer: number | undefined
let busy = false
let reschedule = false

/*------------------------------------*/

function rescheduleHistoryRequest() {
	if (busy) {
		reschedule = true
	} else {
		if (historyTimer !== undefined)
			window.clearTimeout(historyTimer)
		historyTimer = window.setTimeout(doHistoryRequest, 100)
	}
}

/*------------------------------------*/

interface IArgsOfHistoryQuery {
	type: string
	id: string[]
	start?: number
	end?: number
	limit?: number
}

interface IArgsByType {
	[type: string]: IArgsOfHistoryQuery
}

function parseResult(type: string, csv: string): boolean {
	const lines = csv.split('\n')
	const colID: string[] = []	// IDs inside historyRequests
	let ts = 0
	let finished = true
	let len = lines.length
	if (len && !lines[len - 1])
		len--
	let result = false

	for (let i = 0; i < len; i++) {
		const cols = lines[i].split(';')
		const head: string = cols.shift() as string	// string.split always returns at least one item
		const colsLen = cols.length

		if (!i) {
			if (head !== type)
				throw new Error('Nieprawidłowy typ rzeczy w nagłówku odpowiedzi - ' + cols[0] + ' zamiast ' + type)

			for (let j = 0; j < colsLen; j++)
				colID[j] = type + '.' + cols[j]
		} else if (i === len - 1 && !colsLen && head === '...') {
			finished = false
		} else {
			if (colsLen !== colID.length)
				throw new Error('Nieprawidłowa liczba kolumn - ' + colsLen + ' zamiast ' + colID.length + ': ' + lines[i])

			ts += strToInt(head)
			for (let j = 0; j < colsLen; j++)
				if (cols[j] !== '') {
					const value = type === 'devices' ? cols[j] !== '0' : strToFloat(cols[j])
					historyRequests[colID[j]].result.push({
						ts,
						value,
					})
				}
		}
	}

	for (const rid of colID) {
		const req = historyRequests[rid]
		req.finished = finished
		req.cb(req.place, type as ThingType, req.id, req.result)
		if (!finished && ts) {
			req.tsMin = ts + 1
			result = true
		}
	}

	return result
}

function createArgsByType(): IArgsByType {
	const argsByType: IArgsByType = {}

	for (const rid in historyRequests) {
		const req = historyRequests[rid]
		if (req.finished)
			continue
		if (!argsByType[req.type])
			argsByType[req.type] = {
				type: req.type,
				id: [],
			}
		const args = argsByType[req.type]
		args.id.push(req.id)
		// args.limit = max(req.cntMax)
		if (req.cntMax !== undefined && (args.limit === undefined || args.limit < req.cntMax))
			args.limit = req.cntMax
		// args.start = min(req.tsMin)
		if (req.tsMin !== undefined && (args.start === undefined || args.start > req.tsMin))
			args.start = req.tsMin
		// args.end = max(req.tsMax)
		if (req.tsMax !== undefined && (args.end === undefined || args.end < req.tsMax))
			args.end = req.tsMax
	}

	return argsByType
}

function doHistoryRequest() {
	busy = true
	historyTimer = undefined
	const argsByType: IArgsByType = createArgsByType()
	let promise = Promise.resolve()
	for (const type in argsByType) {
		const args = argsByType[type] as unknown as IArgs
		promise = promise.then(() => QueryGet('api_get.php', args))
		.then((response) => {
			CheckResponse(response, 'text/csv')
			return response.text()
		}).then((csv: string) => {
			if (parseResult(type, csv))
				reschedule = true
		})
	}
	promise.catch((e) => console.error(e))
	.then(() => {
		busy = false
		if (reschedule) {
			rescheduleHistoryRequest()
			reschedule = false
		}
	})
}

/*------------------------------------*/

export function api1HistoryRegisterListener(
	place: string,
	type: ThingType,
	id: string,
	tsMin: number,
	tsMax: number,
	cb: THistoryListener) {

	const rid = type + '.' + id
	if (rid in historyRequests)
		throw new Error('Już ktoś słucha historii ' + rid)
	historyRequests[rid] = {
		cb,
		place,
		type,
		id,
		tsMin,
		tsMax,
		result: [],
		finished: false,
	}
	rescheduleHistoryRequest()
	return {
		type,
		id,
	}
}

export function api1HistoryRegisterListenerNewest(
	place: string,
	type: ThingType,
	id: string,
	cntMax: number,
	cb: THistoryListener) {

	const rid = type + '.' + id
	if (rid in historyRequests)
		throw new Error('Już ktoś słucha historii ' + rid)
	historyRequests[rid] = {
		cb,
		place,
		type,
		id,
		cntMax,
		result: [],
		finished: false,
	}
	rescheduleHistoryRequest()
	return {
		type,
		id,
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function api1HistoryUnregisterListener(query: any) {
	if (typeof query !== 'object' || typeof query.type !== 'string' || typeof query.id !== 'string')
		throw new Error('Nieprawidłowa kwerenda: ' + query)
	const rid = query.type + '.' + query.id
	if (!(rid in historyRequests))
		throw new Error('Nikt nie słucha historii ' + rid)
	delete historyRequests[rid]
}

/*------------------------------------*/
