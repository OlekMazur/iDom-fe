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

import { DataProvider, IDataListener } from '../Provider'
import { QueryGet, CheckResponse, AutoParseResponse } from '../Client'

export type DataProcessorCallback = (data: string | object) => object

export interface IPollingListener extends IDataListener {
	dataChanged: (data: string | object) => void
}

export class PollingFetcher extends DataProvider {

	private updatePromise?: Promise<Response>
	private updateTimer?: number
	private timeoutTimer?: number

	constructor(
		protected listener: IPollingListener,
		private url: string,
		private contentType: string,
		private processor?: DataProcessorCallback,
		private period: number = 2000,
		private timeout: number = 2000) {
		super()
	}

	public start() {
		super.start()
		this.update()
	}

	public stop() {
		super.stop()
		if (this.updateTimer) {
			window.clearTimeout(this.updateTimer)
			this.updateTimer = undefined
		}
		if (this.timeoutTimer) {
			window.clearTimeout(this.timeoutTimer)
			this.timeoutTimer = undefined
		}
	}

	private readonly update = () => {
		this.updateTimer = undefined
		//this.listener.statusChanged('working')
		this.updatePromise = QueryGet(this.url)
		this.timeoutTimer = window.setTimeout(() => {
			this.timeoutTimer = undefined
			if (!this.active) {
				return
			}
			this.listener.statusChanged('timeout')
		}, this.timeout)
		return this.updatePromise
		.then((response) => {
			CheckResponse(response, this.contentType)
			return AutoParseResponse(response)
		}).then((body) => this.processor ? this.processor(body) : body)
		.then((data) => {
			if (!this.active) {
				return
			}
			this.listener.statusChanged('ok')
			this.listener.dataChanged(data)
		}).catch((error) => this.active && this.listener.statusChanged('error', error.message))
		.then(() => {
			if (this.timeoutTimer !== undefined)
				window.clearTimeout(this.timeoutTimer)
			if (!this.active) {
				return
			}
			this.updateTimer = window.setTimeout(this.update, this.period)
		})
	}
}
