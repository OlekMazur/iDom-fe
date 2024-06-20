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

import CSVProcessor from './CSVProcessor'
import { IVideo } from '../Video'

class VideosProcessor extends CSVProcessor<IVideo[]> {

	private cam: string[] = []

	constructor(private camPrefix: string = '') {
		super()
	}

	protected readonly initialize = (): IVideo[] => {
		return []
	}

	protected readonly processLine = (cols: string[]) => {
		if (cols[0]) {
			this.processVideo(cols)
		} else {
			this.processCam(cols)
		}
		return true
	}

	protected readonly finish = () => {
		return true
	}

	private readonly processCam = (line: string[]) => {
		if (line.length < 3)
			throw this.error(101, line)

		this.cam.push(line[2])
	}

	private readonly processVideo = (line: string[]) => {
		if (this.result === undefined)
			throw this.error(100, line)
		if (line.length < 4)
			throw this.error(102, line)

		const video: IVideo = {
			no: this.convertInteger(line[0]),
			ext: line[1],
			size: this.convertInteger(line[2]),
			ts: this.convertInteger(line[3]),
		}
		if (line[4]) {
			const camIdx = this.convertInteger(line[4])
			if (camIdx >= this.cam.length)
				throw this.error(103, line)
			video.cam = this.camPrefix + this.cam[camIdx]
		}
		if (line[5])
			video.hasTN = this.convertInteger(line[5])
		if (line[6])
			video.wantTN = this.convertInteger(line[6])
		this.result.push(video)
	}
}

export default function ProcessVideos(csv: string, camPrefix?: string): IVideo[] {
	const processor = new VideosProcessor(camPrefix)
	return processor.process(csv)
}
