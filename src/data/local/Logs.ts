/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021 Aleksander Mazur
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

import { QueryGet, CheckResponse } from '../Client'
import { ILogFile, TLogsListener } from '../API'
import ProcessLogs from './ProcessLogs'

/*------------------------------------*/

function QueryLogs(): Promise<string> {
	//console.log('QueryLogs')
	return QueryGet('/cgi-bin/syslogs')
	.then((response) => {
		CheckResponse(response, 'text/csv')
		return response.text()
	})
}

/*------------------------------------*/

interface ILogsQuery {
	active: boolean
	timeout?: number
}

function localRetryQueryLogs(query: ILogsQuery, place: string, listener: TLogsListener) {
	query.timeout = window.setTimeout(() => localQueryLogs(query, place, listener), 10000)
}

function localQueryLogs(query: ILogsQuery, place: string, listener: TLogsListener) {
	query.timeout = undefined
	QueryLogs()
	.then(ProcessLogs)
	.then((result: ILogFile[]) => {
		if (query.active) {
			listener(place, result)
			localRetryQueryLogs(query, place, listener)
		}
	}).catch((e) => {
		console.log('logs', e)
		if (query.active)
			localRetryQueryLogs(query, place, listener)
	})
}

/*------------------------------------*/

export function localLogsRegisterListener(place: string, listener: TLogsListener): ILogsQuery {
	const query: ILogsQuery = {
		active: true,
	}
	localQueryLogs(query, place, listener)
	return query
}

export function localLogsUnregisterListener(query: ILogsQuery) {
	query.active = false
	if (query.timeout) {
		window.clearTimeout(query.timeout)
		query.timeout = undefined
	}
}

/*------------------------------------*/
