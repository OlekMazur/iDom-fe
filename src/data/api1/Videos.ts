/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2024 Aleksander Mazur
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

import { IArgs, QueryGet, QueryPost, ExpectResponseEmpty, CheckResponse } from '../Client'
import { TVideosListener } from '../API'
import { IVideo } from '../Video'
import ProcessVideos from '../csv/ProcessVideos'
import { formatNumberLeadingZeros } from '../../format'

/*------------------------------------*/

function QueryVideos(place: string, limit?: number, min?: number, max?: number): Promise<string> {
	//console.log('QueryVideos', place, limit, min, max)
	const args: IArgs = {
		place,
	}
	if (limit !== undefined)
		args.limit = limit.toString()
	if (min !== undefined)
		args.min = min.toString()
	if (max !== undefined)
		args.max = max.toString()
	return QueryGet('video.php', args)
	.then((response) => {
		CheckResponse(response, 'text/csv')
		return response.text()
	})
}

/*------------------------------------*/

export function api1VideosRegisterListener(place: string, min: number, max: number, listener: TVideosListener) {
	QueryVideos(place, undefined, min, max)
	.then(ProcessVideos)
	.then((result) => listener(place, result))
	.catch((e) => {
		console.log('videos', e)
		listener(place, [])
	})
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function api1VideosUnregisterListener(query: void): void {
}

/*------------------------------------*/

export function api1NewestVideosRegisterListener(place: string, limit: number, listener: TVideosListener) {
	QueryVideos(place, limit)
	.then(ProcessVideos)
	.then((result) => listener(place, result))
	.catch((e) => {
		console.log('videos', e)
		listener(place, [])
	})
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function api1NewestVideosUnregisterListener(query: void) {
}

/*------------------------------------*/

export function api1OrderVideo(place: string, video: IVideo, order: boolean): Promise<void> {
	console.log('api1OrderVideo', place, video.no, order)
	return QueryPost('order.php', {
		place,
		no: video.no,
		order: order ? 1 : 0,
	})
	.then(ExpectResponseEmpty)
}

export function api1OrderVideoTNUpTo(place: string, video: IVideo, wantTN?: number): Promise<void> {
	console.log('api1OrderVideoTNUpTo', place, video.no, wantTN)
	const args: IArgs = {
		place,
		no: video.no,
	}
	if (wantTN)
		args.want = wantTN.toString()
	return QueryPost('tn.php', args)
	.then(ExpectResponseEmpty)
}

/*------------------------------------*/

export function getApi1VideoTNURL(place: string, no: number, frame: number): string {
	return 'tn/'
		+ place + '/'
		+ formatNumberLeadingZeros(no, 8) + '/'
		+ formatNumberLeadingZeros(frame, 8) + '.jpg'
}

/*------------------------------------*/
