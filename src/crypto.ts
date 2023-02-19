/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2023 Aleksander Mazur
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

/**************************************/

export function sha256(data: ArrayBuffer): Promise<string> {
	// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
	return crypto.subtle.digest('SHA-256', data).then((hash) =>
		Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
	)
}

/**************************************/
