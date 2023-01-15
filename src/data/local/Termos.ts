/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019 Aleksander Mazur
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

import { QueryGet, CheckResponse, QueryPostBinary, ExpectResponseEmpty } from '../Client'
import { TERMOSTAT_BIN } from '../Things'

export function LocalQueryTermos(): Promise<ArrayBuffer> {
	return QueryGet(TERMOSTAT_BIN)
	.then((response) => {
		CheckResponse(response, 'application/octet-stream')
		return response.arrayBuffer()
	})
}

export function LocalPostTermos(data: ArrayBuffer): Promise<void> {
	return QueryPostBinary('/cgi-bin/' + TERMOSTAT_BIN, data)
	.then(ExpectResponseEmpty)
}
