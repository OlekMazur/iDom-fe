/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019 Aleksander Mazur
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
import { IThings, ISensor, IDevice, INeighbour } from '../Things'

class ThingsProcessor extends CSVProcessor<IThings> {

	private messageTS?: number
	private messageGroup?: string

	protected readonly initialize = (): IThings => {
		return {
			ts: NaN,
			sensors: {},
			devices: {},
			variables: {},
			neighbours: {},
			messages: [],
		}
	}

	protected readonly processLine = (cols: string[]) => {
		switch (cols[0]) {
			case 'T':
				this.processTS(cols)
				break
			case 'S':
				this.processSensor(cols)
				break
			case 'D':
				this.processDevice(cols)
				break
			case 'V':
				this.processVariable(cols)
				break
			case 'N':
				this.processNeighbour(cols)
				break
			case 'M':
				this.processMessageList(cols)
				break
			case '':
				this.processMessage(cols)
				break
			default:
				return false
		}

		return true
	}

	protected readonly finish = () => {
		return this.result !== undefined && this.result.ts !== undefined
	}

	private readonly processTS = (line: string[]) => {
		if (line.length !== 2)
			throw this.error(1, line)
		if (this.result === undefined || !isNaN(this.result.ts))
			throw this.error(2, line)
		this.result.ts = this.convertInteger(line[1])
	}

	private readonly processSensor = (line: string[]) => {
		this.messageTS = undefined
		this.messageGroup = undefined

		if (this.result === undefined || isNaN(this.result.ts))
			throw this.error(2, line)
		if (line.length < 6)
			throw this.error(4, line)

		const sensor: ISensor = {
			ts: this.result.ts - this.convertInteger(line[1]),
			name: line[2],
			value: this.convertFloat(line[4]),
			unit: line.slice(5).join(';'),
		}
		if (line[3])
			sensor.alias = line[3]
		this.result.sensors[line[2]] = sensor
	}

	private readonly processDevice = (line: string[]) => {
		this.messageTS = undefined
		this.messageGroup = undefined

		if (this.result === undefined || isNaN(this.result.ts))
			throw this.error(2, line)
		if (line.length < 5)
			throw this.error(4, line)

		const device: IDevice = {
			ts: this.result.ts - this.convertInteger(line[1]),
			name: line[2],
			state: this.convertBoolean(line[4]),
		}
		if (line[3])
			device.alias = line[3]
		this.result.devices[line[2]] = device
	}

	private readonly processVariable = (line: string[]) => {
		this.messageTS = undefined
		this.messageGroup = undefined

		if (this.result === undefined || isNaN(this.result.ts))
			throw this.error(2, line)
		if (line.length < 4)
			throw this.error(4, line)

		this.result.variables[line[2]] = {
			ts: this.result.ts - this.convertInteger(line[1]),
			key: line[2],
			value: line.slice(3).join(';'),
		}
	}

	private readonly processNeighbour = (line: string[]) => {
		this.messageTS = undefined
		this.messageGroup = undefined

		if (this.result === undefined || isNaN(this.result.ts))
			throw this.error(2, line)
		if (line.length < 6)
			throw this.error(4, line)

		const neighbour: INeighbour = {
			ts: this.result.ts - this.convertInteger(line[1]),
			name: line[2],
			state: this.convertBoolean(line[4]),
			info: line.slice(5).join(';'),
		}
		if (line[3])
			neighbour.alias = line[3]
		this.result.neighbours[line[2]] = neighbour
	}

	private readonly processMessageList = (line: string[]) => {
		this.messageTS = undefined
		this.messageGroup = undefined

		if (this.result === undefined || isNaN(this.result.ts))
			throw this.error(2, line)
		if (line.length < 4)
			throw this.error(4, line)

		this.messageTS = this.result.ts - this.convertInteger(line[1])
		this.messageGroup = line[2]
		// line[3] = alias
	}

	private readonly processMessage = (line: string[]) => {
		if (this.messageTS === undefined)
			throw this.error(2, line)
		if (this.messageGroup === undefined)
			throw this.error(2, line)
		if (this.result === undefined || isNaN(this.result.ts))
			throw this.error(2, line)
		if (line.length < 6)
			throw this.error(4, line)

		this.messageTS -= this.convertInteger(line[1])
		const flags = this.convertInteger(line[2])
		this.result.messages.push({
			group: this.messageGroup,
			name: line[3],
			ts: this.messageTS,
			from: line[4],
			content: line.slice(5).join(';').split('\r').join('\n'),
			copy: !!(flags & 1),
			sent: !!(flags & 4),
		})
	}
}

export default function ProcessThings(csv: string | object): IThings {
	if (typeof csv !== 'string')
		throw new Error('Nieprawidłowy typ danych')
	const processor = new ThingsProcessor()
	const result = processor.process(csv)
	if (isNaN(result.ts))
		throw new Error('Nieprawidłowe dane wejściowe')
	return result
}
