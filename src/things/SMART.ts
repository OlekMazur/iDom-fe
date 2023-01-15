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

import template from './SMART.vue.js'
import Vue from 'vue'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faExclamation } from '@fortawesome/free-solid-svg-icons/faExclamation'

export default Vue.extend({
	...template,
	props: {
		info: String as () => string,
	},
	computed: {
		item: function() {
			// parse value to prefail (bool), current, worst, threshold
			const token = this.info.split(' ', 2)
			const raw = parseInt(token[1], 10)
			const tab = token[0].split('/', 2)
			let threshold = tab[1]
			const prefail = threshold.substring(threshold.length - 1) === '!'
			if (prefail)
				threshold = threshold.substring(0, threshold.length - 1)
			let current = tab[0]
			let worst = ''
			const pos = current.indexOf('(')
			if (pos >= 0) {
				worst = ' > ' + current.substring(pos + 1, current.lastIndexOf(')'))
				current = current.substring(0, pos)
			}
			// build result
			return {
				warning: parseInt(current, 10) < parseInt(threshold, 10),
				label: current + worst + ' > ' + threshold,
				prefail,
				raw,
			}
		},
	},
	data: function() {
		return {
			iconWarning: faExclamationTriangle,
			iconPrefail: faExclamation,
		}
	},
})
