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

import template from './DailyThermal.vue.js'
import Vue from 'vue'
import { ITermosThermalProgramEntry } from '../data/Termos'
import { sortProgramEntries } from './utils'
import DailyThermalEntry from './DailyThermalEntry'
import ButtonAdd from '../widgets/ButtonAdd'

export default Vue.extend({
	...template,
	components: { DailyThermalEntry, ButtonAdd },
	props: {
		program: Array as () => ITermosThermalProgramEntry[],
		step: Number as () => number,
	},
	methods: {
		addEntry: function() {
			const entry: ITermosThermalProgramEntry = this.program.length
				? { ...this.program[this.program.length - 1] }
				: {
					hh: 0,
					mm: 0,
					temp: 0,
					hyst: 0,
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
