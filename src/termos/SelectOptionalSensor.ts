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

import template from './SelectOptionalSensor.vue.js'
import Vue from 'vue'
import { ITermosMapping } from '../data/Things'
import SelectSensor from './SelectSensor'
import ButtonAdd from '../widgets/ButtonAdd'
import ButtonDelete from '../widgets/ButtonDelete'

export default Vue.extend({
	...template,
	components: { SelectSensor, ButtonDelete, ButtonAdd },
	props: {
		value: String as () => string | undefined,
		mapping: Object as () => ITermosMapping | undefined,
	},
	methods: {
		selectSomeSensor: function() {
			let id: string | undefined
			if (this.mapping)
				for (const sensor in this.mapping.sensors) {
					id = sensor
					break
				}
			if (id === undefined)
				id = '000000000000'
			this.$emit('input', id)
		},
	},
})
