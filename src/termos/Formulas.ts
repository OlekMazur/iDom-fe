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

import template from './Formulas.vue.js'
import Vue from 'vue'
import { ITermosMapping, describeRelay } from '../data/Things'
import { ITermosFormula } from '../data/Termos'
import Formula from './Formula'
import ButtonAdd from '../widgets/ButtonAdd'

export default Vue.extend({
	...template,
	components: { Formula, ButtonAdd },
	props: {
		formulas: Object as () => ITermosFormula[],
		mapping: Object as () => ITermosMapping | undefined,
	},
	methods: {
		describeRelay: function(index: number): string {
			return describeRelay(this.mapping, index)
		},
		addEntry: function() {
			const entry: ITermosFormula = this.formulas.length
				? { ...this.formulas[this.formulas.length - 1] }
				: {
					mask1: 0,
					mask2: 0,
					relays: 0,
				}
			this.formulas.push(entry)
		},
		deleteEntry: function(index: number) {
			if (index >= 0)
				this.formulas.splice(index, 1)
		},
	},
})
