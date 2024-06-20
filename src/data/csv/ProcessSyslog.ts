/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2021 Aleksander Mazur
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
import { ISyslogEntry } from '../Syslog'

interface ISyslog {
	entries: ISyslogEntry[]
	identities: {
		[identity: string]: true
	}
}

class SyslogProcessor extends CSVProcessor<ISyslog> {

	protected readonly initialize = (): ISyslog => {
		return {
			entries: [],
			identities: {},
		}
	}

	protected readonly processLine = (cols: string[]) => {
		if (this.result === undefined)
			throw this.error(100, cols)
		if (cols.length < 5)
			throw this.error(101, cols)

		const identity = cols[3]
		this.result.entries.unshift({
			severity: this.convertInteger(cols[0]),
			facility: this.convertInteger(cols[1]),
			ts: this.convertFloat(cols[2]),
			identity,
			pid: cols[4] ? this.convertInteger(cols[4]) : undefined,
			msg: cols.slice(5).join(';'),
		})
		this.result.identities[identity] = true
		return true
	}

	protected readonly finish = () => {
		return true
	}
}

export default function ProcessSyslog(csv: string, identities: string[]): ISyslogEntry[] {
	const processor = new SyslogProcessor()
	const result = processor.process(csv)
	identities.length = 1
	for (const identity in result.identities)
		identities.push(identity)
	return result.entries
}
