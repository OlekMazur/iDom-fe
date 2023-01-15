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

import { strToInt, strToFloat } from '../../utils'
import ProcessorError from './ProcessorError'

export default abstract class CSVProcessor<Result> {

	protected result?: Result
	private lineno = 0

	public readonly process = (csv: string): Result => {
		this.result = this.initialize()

		const lines = csv.split('\n')
		for (this.lineno = 1; this.lineno <= lines.length; this.lineno++) {
			const line = lines[this.lineno - 1]
			if (line === '')
				continue
			const cols = line.split(';')

			if (!this.processLine(cols))
				throw this.error(1, line)
		}

		if (!this.finish())
			throw this.error(2)

		return this.result
	}

	protected abstract initialize(): Result

	protected abstract processLine(cols: string[]): boolean

	protected abstract finish(): boolean

	protected readonly error = (code: number, msg?: string | string[]): ProcessorError => {
		return new ProcessorError(code, this.lineno, msg)
	}

	protected readonly convertInteger = (val: string): number => {
		try {
			return strToInt(val)
		} catch (e) {
			throw this.error(3, val)
		}
	}

	protected readonly convertFloat = (val: string): number => {
		try {
			return strToFloat(val)
		} catch (e) {
			throw this.error(4, val)
		}
	}

	protected readonly convertBoolean = (val: string) => {
		if (!/^0|1$/.test(val))
			throw this.error(5, val)
		return val === '1'
	}
}
