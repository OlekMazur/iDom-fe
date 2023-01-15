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

import template from './DailyTimer.vue.js'
import Vue from 'vue'
import { ITermosTimerProgramEntry } from '../data/Termos'
import { ITermosMapping, describeRelay } from '../data/Things'
import { sortProgramEntries } from './utils'
import DailyTimerEntry from './DailyTimerEntry'
import ButtonAdd from '../widgets/ButtonAdd'

export default Vue.extend({
	...template,
	components: { DailyTimerEntry, ButtonAdd },
	props: {
		program: Array as () => ITermosTimerProgramEntry[],
		mapping: Object as () => ITermosMapping | undefined,
	},
	methods: {
		describeRelay: function(index: number): string {
			return describeRelay(this.mapping, index)
		},
		addEntry: function() {
			const entry: ITermosTimerProgramEntry = this.program.length
				? { ...this.program[this.program.length - 1] }
				: {
					hh: 0,
					mm: 0,
					relaysOn: 0,
					relaysOff: 0,
					relaysOnce: 0,
				}
			this.program.push(entry)
		},
		deleteEntry: function(index: number) {
			if (index >= 0)
				this.program.splice(index, 1)
		},
		sortEntries: function() {
			sortProgramEntries(this.program)
		},
	},
})
