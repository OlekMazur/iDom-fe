/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020 Aleksander Mazur
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

import { DataStatus } from '../API'
import { IAudios, IAudiosListener } from '../Audio'
import { IArgs, QueryGet, QueryPost, ExpectResponseEmpty, CheckResponse } from '../Client'
import { PollingFetcher, IPollingListener } from './PollingFetcher'

/*------------------------------------*/

export interface IAudioStatus {
	audio: {
		capture?: string
		clients: number
		a: number
		b: number
		rate: number
		playback?: string,
	}
	radio?: {
		frequency: number
		signal: number
		afc: number
		error?: string,
	}
}

/*------------------------------------*/

class LocalAudiosListener implements IPollingListener {
	public statusChanged: (status: DataStatus, message?: string) => void

	constructor(private audiosListener: IAudiosListener) {
		this.statusChanged = audiosListener.statusChanged
	}

	public readonly dataChanged = (data: string | object) => {
		if (typeof data !== 'object') {
			return
		}
		this.audiosListener.audiosChanged(data as IAudios)
	}
}

/*------------------------------------*/

export class LocalAudiosProvider extends PollingFetcher {
	constructor(audiosListener: IAudiosListener) {
		super(new LocalAudiosListener(audiosListener), '/cgi-bin/audios.json', 'application/json')
	}
}

/*------------------------------------*/

export function localAudioStatus(audio: string): Promise<IAudioStatus> {
	return QueryGet('/cgi-bin/audio.json', {
		audio,
	}).then((response) => {
		CheckResponse(response, 'application/json')
		return response.json()
	}).then((data) => {
		if (typeof data !== 'object') {
			throw new Error('audio: ' + data)
		}
		return data
	})
}

export function localRadioTune(audio: string, frequency: number): Promise<void> {
	return QueryPost('/cgi-bin/radio', {
		audio,
		frequency: frequency.toString(),
	}).then(ExpectResponseEmpty)
}

export function localAudioCtl(audio: string, op: string, arg?: string): Promise<void> {
	const args: IArgs = {
		audio,
		op,
	}
	if (arg !== undefined)
		args.arg = arg
	return QueryPost('/cgi-bin/audio', args)
	.then(ExpectResponseEmpty)
}

export function localAudioStreamURL(port: number): string {
	return `http://${location.hostname}:${port}/cgi-bin/audio.wav`
}
