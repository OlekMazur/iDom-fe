/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020, 2022, 2025 Aleksander Mazur
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

import { IDataListener } from './Provider'

/*------------------------------------*/

export interface IRadioBand {
	min: number
	max: number
}

export interface IRadioCaps {
	card?: string
	bus_info?: string
	driver?: string
	bands?: IRadioBand[]
}

export interface IAudioCaps {
	type?: string
	name?: string
	port?: number
}

export interface IRecordCaps extends IAudioCaps {
	tuner?: IRadioCaps | string
}

export interface IRecordDevices {
	[name: string]: IRecordCaps
}

const isIRecordDevices = (x: unknown): x is IRecordDevices => !!x
	&& typeof x == 'object'

export type IPlaybackCaps = IAudioCaps

export interface IPlaybackDevices {
	[name: string]: IPlaybackCaps
}

const isIPlaybackDevices = (x: unknown): x is IPlaybackDevices => !!x
	&& typeof x == 'object'

export interface IAudios {
	record: IRecordDevices
	playback: IPlaybackDevices
}

export const isIAudios = (x: unknown): x is IAudios => !!x
	&& typeof x == 'object'
	&& isIRecordDevices((x as IAudios).record)
	&& isIPlaybackDevices((x as IAudios).playback)

/*------------------------------------*/

export interface IAudiosListener extends IDataListener {
	audiosChanged: (audios: IAudios) => void
}
