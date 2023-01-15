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

import { strToFloat } from '../../utils'
import { QueryGet, CheckResponse } from '../Client'

export interface ISyslogRaw {
	bootTS?: number
	raw: string
}

export function QuerySyslog(level: number): Promise<ISyslogRaw> {
	let bootTS: number | undefined
	return QueryGet('/cgi-bin/syslog', {
		level: level.toString(),
	}).then((response) => {
		CheckResponse(response, 'text/csv')
		const bootTSHdr = response.headers.get('X-BootTime')
		if (bootTSHdr !== null) {
			bootTS = strToFloat(bootTSHdr)
		}
		return response.text()
	}).then((raw) => ({
		bootTS,
		raw,
	}))
}
