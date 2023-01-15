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

import { DataStatus } from '../API'
import { ISystemInfo, ISystemInfoListener } from '../System'
import { PollingFetcher, IPollingListener } from './PollingFetcher'

/*------------------------------------*/

class LocalSystemInfoListener implements IPollingListener {
	public statusChanged: (status: DataStatus, message?: string) => void

	constructor(private siListener: ISystemInfoListener) {
		this.statusChanged = siListener.statusChanged
	}

	public readonly dataChanged = (data: string | object) => {
		if (typeof data !== 'object') {
			return
		}
		this.siListener.systemInfoChanged(data as ISystemInfo)
	}
}

/*------------------------------------*/

export class LocalSystemInfoProvider extends PollingFetcher {
	constructor(siListener: ISystemInfoListener) {
		super(new LocalSystemInfoListener(siListener), '/cgi-bin/net', 'application/json')
	}
}

/*------------------------------------*/
