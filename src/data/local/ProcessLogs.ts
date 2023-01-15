/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021 Aleksander Mazur
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
import { ILogFile } from '../API'

class LogsProcessor extends CSVProcessor<ILogFile[]> {

	protected readonly initialize = (): ILogFile[] => {
		return []
	}

	protected readonly processLine = (line: string[]) => {
		if (this.result === undefined)
			throw this.error(100, line)
		if (line.length < 2)
			throw this.error(102, line)

		const logFile: ILogFile = {
			name: line[0],
			size: this.convertInteger(line[1]),
		}
		if (line.length >= 3) {
			logFile.desc = line[2]
		}
		this.result.push(logFile)

		return true
	}

	protected readonly finish = () => {
		return true
	}
}

export default function ProcessLogs(csv: string): ILogFile[] {
	const processor = new LogsProcessor()
	return processor.process(csv)
}
