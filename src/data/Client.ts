/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021, 2023 Aleksander Mazur
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

export interface IArgs {
	[param: string]: string | string[] | number
}

const CONTENT_TYPE = 'Content-Type'

export function encodeArgs(args: IArgs): string {
	return Object.keys(args).map((param) => {
		if (Array.isArray(args[param]))
			return (args[param] as string[])
			.map((item) => encodeURIComponent(param) + '[]=' + encodeURIComponent(item)).join('&')
		else
			return encodeURIComponent(param) + '=' + encodeURIComponent(args[param].toString())
	}).join('&')
}

function newCommonFetchOptions(): RequestInit {
	return {
		mode: 'same-origin',
		//cache: 'reload',
		redirect: 'error',
		keepalive: true,
	}
}

const commonFetchOptions = newCommonFetchOptions()

export function QueryGet(url: string, args?: IArgs): Promise<Response> {
	if (args)
		url += '?' + encodeArgs(args)
	return fetch(url, commonFetchOptions)
}

export function QueryPost(url: string, args?: IArgs): Promise<Response> {
	const options = newCommonFetchOptions()
	options.method = 'POST'
	if (args) {
		options.body = encodeArgs(args)
		options.headers = {}
		options.headers[CONTENT_TYPE] = 'application/x-www-form-urlencoded'
	}
	return fetch(url, options)
}

function QueryPostData(url: string, data: ArrayBuffer | FormData, ct?: string): Promise<Response> {
	const options = newCommonFetchOptions()
	options.method = 'POST'
	options.body = data
	if (ct) {
		options.headers = {}
		options.headers[CONTENT_TYPE] = ct
	}
	return fetch(url, options)
}

export function QueryPostBinary(url: string, data: ArrayBuffer): Promise<Response> {
	return QueryPostData(url, data, 'application/octet-stream')
}

export function QueryPostForm(url: string, data: FormData): Promise<Response> {
	return QueryPostData(url, data)
}

export function CheckResponse(response: Response, contentType?: string): void {
	if (!response.ok)
		throw new Error('Błąd ' + response.status + ': ' + response.statusText)
	if (contentType !== undefined) {
		let type = response.headers.get(CONTENT_TYPE)
		if (!type)
			throw new Error('Zła odpowiedź serwera')
		type = type.split(';', 1)[0]
		if (type !== contentType)
			throw new Error('Zła odpowiedź serwera: ' + type)
	}
}

export function AutoParseResponse(response: Response): Promise<string | object> {
	let type = response.headers.get(CONTENT_TYPE)
	if (!type)
		return Promise.reject()
	type = type.split(';', 1)[0]
	type = type.split('/', 2)[1]
	return type === 'json' ? response.json() : response.text()
}

function ExpectResponseText(response: Response, value: string) {
	CheckResponse(response, 'text/plain')
	return response.text()
	.then((text) => {
		if (text === value)
			return
		throw new Error(text)
	})
}

export function ExpectResponseZero(response: Response) {
	return ExpectResponseText(response, '0\n')
}

export function ExpectResponseEmpty(response: Response) {
	return ExpectResponseText(response, '')
}
