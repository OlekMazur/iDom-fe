/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021 Aleksander Mazur
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

import template from './DailyCommonEntry.vue.js'
import Vue from 'vue'
import { ITermosProgramTimeRange } from '../data/Termos'
import { formatNumberLeadingZeros } from '../format'
import EditString from '../widgets/EditString'

export default Vue.extend({
	...template,
	components: { EditString },
	props: {
		entry: Object as () => ITermosProgramTimeRange,
		rowspan: Number as () => number,
	},
	computed: {
		hhmm: function() {
			return formatNumberLeadingZeros(this.entry.hh, 2)
				+ ':'
				+ formatNumberLeadingZeros(this.entry.mm, 2)
		},
	},
	methods: {
		change: function(newValue: string) {
			if (!newValue || newValue.length !== 5)
				return
			const hhmm = newValue.split(':', 3).map((x) => parseInt(x, 10))
			if (hhmm.length !== 2 || isNaN(hhmm[0]) || isNaN(hhmm[1]) ||
				hhmm[0] < 0 || hhmm[0] >= 24 ||
				hhmm[1] < 0 || hhmm[1] >= 60)
				return
			this.entry.hh = hhmm[0]
			this.entry.mm = hhmm[1]
			this.$emit('change', {
				hh: hhmm[0],
				mm: hhmm[1],
			})
		},
	},
})
