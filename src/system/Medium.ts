/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2022, 2025 Aleksander Mazur
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

import template from './Medium.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave'
import { faHdd } from '@fortawesome/free-solid-svg-icons/faHdd'
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
import { faBoltLightning } from '@fortawesome/free-solid-svg-icons/faBoltLightning'
import { faFilm } from '@fortawesome/free-solid-svg-icons/faFilm'
import { faFileExport } from '@fortawesome/free-solid-svg-icons/faFileExport'
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe'
import { faMicrochip } from '@fortawesome/free-solid-svg-icons/faMicrochip'
import { ISystemInfoMedium } from '../data/System'
import { formatNumberWithUnit } from '../format'

export interface IMediumWithName extends ISystemInfoMedium {
	name: string
	mounts: string[]
}

interface IMediumFunc {
	name: string
	icon?: IconDefinition
}

const mediumFuncIcon: { [name: string]: IconDefinition } = {
	'boot': faBoltLightning,
	'dvr': faFilm,
	'dvr-copy': faFileExport,
	'system': faDatabase,
	'internet': faGlobe,
	'firmware': faMicrochip,
}

function mapMount2Func(name: string): IMediumFunc {
	const result: IMediumFunc = { name }
	if (name in mediumFuncIcon)
		result.icon = mediumFuncIcon[name]
	return result
}

export default Vue.extend({
	...template,
	props: {
		data: Object as () => IMediumWithName,
	},
	computed: {
		icon: function(): IconDefinition {
			return this.data.removable ? faSave : faHdd
		},
		totalSpace: function(): string {
			return this.data.sectors ? formatNumberWithUnit(this.data.sectors / 2, 'B', 1024, 1) : '-'
		},
		availSpace: function(): string {
			return this.data.avail ? formatNumberWithUnit(this.data.avail / 2, 'B', 1024, 1) : '-'
		},
		funcsRaw: function(): string[] {
			const result: string[] = []
			if (this.data.upstream)
				result.push('internet')
			return result.concat(this.data.mounts)
		},
		funcs: function(): IMediumFunc[] {
			return this.funcsRaw.map(mapMount2Func)
		},
	},
})
