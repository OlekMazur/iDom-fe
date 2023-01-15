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

import template from './Throughput.vue.js'
import Vue from 'vue'
import { formatNumberWithUnit } from '../format'

export interface IThroughputData {
	bytes: number
	uptime: number
}

export default Vue.extend({
	...template,
	props: {
		data: Object as () => IThroughputData,
	},
	data: function() {
		return {
			prev: undefined as undefined | IThroughputData,
		}
	},
	watch: {
		data: function(newValue, oldValue) {
			this.prev = newValue.bytes < oldValue.bytes ? undefined : oldValue
		},
	},
	computed: {
		bytesStr: function(): string {
			return formatNumberWithUnit(this.data.bytes, 'B', 1024)
		},
		speedStr: function(): string {
			if (this.prev !== undefined) {
				const time = this.data.uptime - this.prev.uptime
				if (time > 0)
					return formatNumberWithUnit((this.data.bytes - this.prev.bytes) / time / 128, 'bps', 1024, 1)
			}
			return ''
		},
	},
})
