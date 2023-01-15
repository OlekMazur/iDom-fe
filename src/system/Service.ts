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

import template from './Service.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause'
import { faHandPaper } from '@fortawesome/free-solid-svg-icons/faHandPaper'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop'
import { ISystemInfoService } from '../data/System'
import { formatElapsedTime, formatNumberWithUnit } from '../format'

export interface IServiceWithName extends ISystemInfoService {
	name: string
}

function cpuBusyTime(data: ISystemInfoService): number {
	let result = 0
	if (data.cpu_utime)
		result += data.cpu_utime
	if (data.cpu_stime)
		result += data.cpu_stime
	return result
}

export default Vue.extend({
	...template,
	props: {
		data: Object as () => IServiceWithName,
		uptime: Number as () => number,
	},
	data: function() {
		return {
			prev: undefined as undefined | ISystemInfoService,
			prevUptime: undefined as undefined | number,
		}
	},
	watch: {
		data: function(curr, prev: IServiceWithName) {
			this.prev = {
				cpu_utime: prev.cpu_utime,
				cpu_stime: prev.cpu_stime,
			}
		},
		uptime: function(curr, prev: number) {
			this.prevUptime = prev < curr ? prev : undefined
		},
	},
	computed: {
		elapsed: function(): string {
			if (!this.data.elapsed)
				return ''
			return formatElapsedTime(this.data.elapsed)
		},
		memRSS: function(): string {
			if (!this.data.mem_rss)
				return ''
			return formatNumberWithUnit(this.data.mem_rss / 1024, 'B', 1024, 2)
		},
		cpuUsage: function(): string {
			if (!this.prev || !this.prevUptime || this.prevUptime >= this.uptime)
				return ''
			const prevTime = cpuBusyTime(this.prev)
			if (!prevTime)
				return ''
			const currTime = cpuBusyTime(this.data)
			if (!currTime || currTime <= prevTime)
				return ''
			const busyTime = 100 * (currTime - prevTime) / (this.uptime - this.prevUptime)
			return formatNumberWithUnit(busyTime, '%')
		},
		icon: function(): IconDefinition {
			if (this.data.run) {
				if (this.data.want_down)
					return faArrowDown
				else if (this.data.paused)
					return faPause
				else if (this.data.got_term)
					return faHandPaper
				else
					return faPlay
			} else {
				if (this.data.want_up)
					return faArrowUp
				else
					return faStop
			}
		},
	},
})
