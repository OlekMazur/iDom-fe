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

import template from './Timestamp.vue.js'
import Vue from 'vue'
import { formatDate, formatTime } from '../format'

export default Vue.extend({
	...template,
	props: {
		ts: Number as () => number,
		baseTS: Number as () => number,
		timeout: Number as () => number,
	},
	computed: {
		old: function(): boolean {
			return this.baseTS - this.ts > this.timeout
		},
		dt: function(): Date {
			return new Date(this.ts * 1000)
		},
		line1: function(): string {
			if (!this.old)
				return ''
			const now = new Date()
			return this.dt.getDate() !== now.getDate() ||
				this.dt.getMonth() !== now.getMonth() ||
				this.dt.getFullYear() !== now.getFullYear() ? formatDate(this.dt) : ''
		},
		line2: function(): string {
			return this.old ? formatTime(this.dt) : ''
		},
	},
})
