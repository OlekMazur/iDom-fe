/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2024 Aleksander Mazur
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

/*------------------------------------*/

/** An interface describing single video recording. */
export interface IVideo {
	/** Number of the recording. */
	no: number
	/** File extension, starting with a dot. */
	ext: string
	/** File size, in bytes. */
	size: number
	/** Timestamp of the recording (e.g. file modification time), in seconds since Epoch. */
	ts: number
	/** ID of a device which recorded the video. If given, it should match some key of IThings.devices. */
	cam?: string
	/** Number of thumbnails already available. */
	hasTN?: number
	/** Number of wanted thumbnails. */
	wantTN?: number
	/** Whether current user has already put an order to get this video. */
	order?: boolean
}

/*------------------------------------*/
