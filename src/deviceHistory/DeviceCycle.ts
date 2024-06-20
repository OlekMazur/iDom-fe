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

import template from './DeviceCycle.vue.js'
import Vue from 'vue'
import { formatTS, formatElapsedTime, formatNumberWithUnit } from '../format'
import { IDeviceCycle } from '../history'
import ButtonDelete from '../widgets/ButtonDelete'

export default Vue.extend({
	...template,
	components: { ButtonDelete },
	props: {
		entry: Object as () => IDeviceCycle,
		index: Number as () => number,
		deletableShorterThan: Number as () => number,
	},
	computed: {
		ts: function(): string {
			return this.entry.ts ? formatTS(this.entry.ts) : ''
		},
		elapsedOn: function(): string | undefined {
			return this.entry.on !== undefined && formatElapsedTime(this.entry.on) || undefined
		},
		elapsedOff: function(): string | undefined {
			return this.entry.off !== undefined && formatElapsedTime(this.entry.off) || undefined
		},
		percentOn: function(): string {
			return this.entry.on !== undefined && this.entry.total !== undefined
				? formatNumberWithUnit(100 * this.entry.on / this.entry.total, '%')
				: ''
		},
		percentOff: function(): string {
			return this.entry.off !== undefined && this.entry.total !== undefined
				? formatNumberWithUnit(100 * this.entry.off / this.entry.total, '%')
				: ''
		},
		elapsedTotal: function(): string {
			return this.entry.total !== undefined ? formatElapsedTime(this.entry.total) : ''
		},
	},
})
