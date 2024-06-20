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

import { DataStatus } from '../Provider'
import { IThings, IThingsListener } from '../Things'
import { PollingFetcher, IPollingListener } from './PollingFetcher'
import ProcessThings from '../csv/ProcessThings'

/*------------------------------------*/

const PLACE = ''

/*------------------------------------*/

class LocalThingsListener implements IPollingListener {
	public statusChanged: (status: DataStatus, message?: string) => void

	constructor(private thingsListener: IThingsListener) {
		this.statusChanged = thingsListener.statusChanged
	}

	public readonly dataChanged = (data: string | object) => {
		if (typeof data !== 'object') {
			return
		}
		this.thingsListener.thingsChanged(PLACE, data as IThings)
	}
}

/*------------------------------------*/

export class LocalThingsProvider extends PollingFetcher {
	constructor(protected thingsListener: IThingsListener) {
		super(new LocalThingsListener(thingsListener), '/cgi-bin/termos', 'text/csv', ProcessThings)
	}

	public start() {
		super.start()
		this.thingsListener.placeAdded(PLACE)
	}
}

/*------------------------------------*/
