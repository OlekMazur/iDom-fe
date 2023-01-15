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

import template from './Functions.vue.js'
import Vue from 'vue'
import { ITermosMapping, describeRelay } from '../data/Things'
import { ITermos, ITermosFunction } from '../data/Termos'
import ProgramTimerWatchdog from './ProgramTimerWatchdog'
import ProgramSensor from './ProgramSensor'
import ButtonAdd from '../widgets/ButtonAdd'

export default Vue.extend({
	...template,
	components: { ProgramTimerWatchdog, ProgramSensor, ButtonAdd },
	props: {
		termos: Object as () => ITermos,
		mapping: Object as () => ITermosMapping | undefined,
	},
	methods: {
		describeRelay: function(index: number): string {
			return describeRelay(this.mapping, index)
		},
		addEntry: function() {
			let entry: ITermosFunction
			if (this.termos.functions.length) {
				const src = this.termos.functions[this.termos.functions.length - 1]
				entry = {
					...src,
					programs: src.programs.slice(0),
				}
			} else {
				let program = ''
				for (const prog in this.termos.thermalPrograms) {
					program = prog
					break
				}
				let sensor = '000000000000'
				if (this.mapping)
					for (const id in this.mapping.sensors) {
						sensor = id
						break
					}
				entry = {
					sensor,
					cooling: false,
					critical: false,
					display: false,
					relays: 0,
					programs: [
						program,
						program,
						program,
						program,
						program,
						program,
						program,
					],
				}
			}
			this.termos.functions.push(entry)
		},
		deleteEntry: function(index: number) {
			if (index >= 0)
				this.termos.functions.splice(index, 1)
		},
	},
})
