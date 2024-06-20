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

import template from './SensorCell.vue.js'
import Vue from 'vue'
import Timestamp from '../widgets/Timestamp'
import { ISensor } from '../data/Things'
import { formatNumberWithUnit } from '../format'

export default Vue.extend({
	...template,
	components: { Timestamp },
	props: {
		ts: Number as () => number,
		thing: Object as () => ISensor,
		termostat: Boolean as () => boolean,
	},
	computed: {
		value: function() {
			if (!this.thing)
				return ''
			/*
			const value = formatNumberWithUnit(this.thing.value, this.thing.unit)
			const [val, unit] = value.split(' ', 2)
			const v = val.split('.', 2)
			if (v.length > 1) {
				v[1] = '.' + v[1]
			} else {
				v.push('')
			}
			return [v[0], v[1], unit]
			*/
			return formatNumberWithUnit(this.thing.value, this.thing.unit)
		},
		timeout: function() {
			return this.termostat ? 10 : 60
		},
	},
})
