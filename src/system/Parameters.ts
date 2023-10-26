/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2022, 2023 Aleksander Mazur
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

import template from './Parameters.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks'
import { faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar'
import { faBolt } from '@fortawesome/free-solid-svg-icons/faBolt'
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt'
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faLinux } from '@fortawesome/free-brands-svg-icons/faLinux'
import { ISystemInfo } from '../data/System'
import { formatNumberWithUnit, formatElapsedTime, formatTS } from '../format'

interface ISystemParameter {
	label: string
	icon: IconDefinition
	value: string
}

export default Vue.extend({
	...template,
	props: {
		data: Object as () => ISystemInfo,
	},
	data: function() {
		return {
			prev: undefined as undefined | ISystemInfo,
		}
	},
	watch: {
		data: function(curr: ISystemInfo, prev: ISystemInfo) {
			this.prev = prev
		},
	},
	computed: {
		params: function() {
			const result: ISystemParameter[] = []
			if (this.data) {
				if (this.data.kernelVersion)
					result.push({
						label: 'Wersja oprogramowania',
						icon: faLinux,
						value: this.data.kernelVersion,
					})
				if (this.data.clock)
					result.push({
						label: 'Stan w chwili',
						icon: faClock,
						value: formatTS(this.data.clock),
					})
				if (this.data.uptime)
					result.push({
						label: 'Czas działania',
						icon: faHeart,
						value: formatElapsedTime(this.data.uptime),
					})
				result.push({
					label: 'Procesy aktywne/wszystkie',
					icon: faTasks,
					value: [
						this.data.procRunning,
						this.data.procAll,
					].join(' / '),
				})
				result.push({
					label: 'Obciążenie 1/5/15 min.',
					icon: faChartBar,
					value: [
						this.data.load1m,
						this.data.load5m,
						this.data.load15m,
					].join(' / '),
				})
				result.push({
					label: 'Obciążenie procesora',
					icon: faBolt,
					value: this.calcCPULoad(),
				})
				result.push({
					label: 'Pamięć wolna/cała',
					icon: faTachometerAlt,
					value: [
						formatNumberWithUnit(this.data.memFreeKB, 'B', 1024, 1),
						formatNumberWithUnit(this.data.memTotalKB, 'B', 1024, 1),
					].join(' / '),
				})
				if (this.data.resolver)
					result.push({
						label: 'DNS',
						icon: faGlobe,
						value: this.data.resolver.join(', '),
					})
			}
			return result
		},
	},
	methods: {
		calcCPULoad: function(): string {
			let total = this.data.uptime
			let idle = this.data.idletime
			if (!total || !idle)
				return '?'
			if (this.prev && this.prev.uptime && this.prev.idletime) {
				total -= this.prev.uptime
				idle -= this.prev.idletime
			}
			if (this.data.cpu && this.data.cpu.length) {
				idle /= this.data.cpu.length
			}
			return formatNumberWithUnit(100 * (total - idle) / total, '%')
		},
	},
})
