/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018 Aleksander Mazur
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
import { TVideosListener } from '../API'
import { IVideo } from '../Video'
import ProcessVideos from './ProcessVideos'
import { formatNumberLeadingZeros } from '../../format'

/*------------------------------------*/

function QueryVideos(min: number, max: number): Promise<string> {
	//console.log('QueryVideos', min, max)
	return QueryGet('/cgi-bin/video', {
		min: min.toString(),
		max: max.toString(),
	}).then((response) => {
		CheckResponse(response, 'text/csv')
		return response.text()
	})
}

/*------------------------------------*/

interface IVideoQuery {
	active: boolean
	latest?: IVideo
	timeout?: number
}

function localRetryQueryVideos(query: IVideoQuery, place: string, min: number, max: number, listener: TVideosListener) {
	if (query.active)
		query.timeout = window.setTimeout(() => localQueryVideos(query, place, min, max, listener), 1000)
}

function localQueryVideos(query: IVideoQuery, place: string, min: number, max: number, listener: TVideosListener) {
	query.timeout = undefined
	QueryVideos(min, max)
	.then(ProcessVideos)
	.then((result: IVideo[]) => {
		const latest = result.find((video: IVideo) => video.no === max)
		if (query.active)
			listener(place, result)
		if (latest && query.latest &&
			latest.no === query.latest.no &&
			latest.ext === query.latest.ext &&
			latest.size === query.latest.size &&
			latest.ts === query.latest.ts)
			query.active = false
		query.latest = latest
		localRetryQueryVideos(query, place, min, max, listener)
	}).catch((e) => {
		console.log('videos', e)
		localRetryQueryVideos(query, place, min, max, listener)
	})
}

/*------------------------------------*/

export function localVideosRegisterListener(place: string, min: number, max: number, listener: TVideosListener)
	: IVideoQuery {
	const query: IVideoQuery = {
		active: true,
	}
	localQueryVideos(query, place, min, max, listener)
	return query
}

export function localVideosUnregisterListener(query: IVideoQuery): void {
	query.active = false
	if (query.timeout) {
		window.clearTimeout(query.timeout)
		query.timeout = undefined
	}
}

/*------------------------------------*/

export function getLocalVideoTNURL(no: number, frame: number): string {
	return '/download/'
		+ formatNumberLeadingZeros(no, 8) + '/'
		+ formatNumberLeadingZeros(frame, 8) + '.jpg'
}

export function getLocalVideoURL(no: number, ext: string): string {
	return '/download/' + formatNumberLeadingZeros(no, 8) + '/.' + ext
}

/*------------------------------------*/
