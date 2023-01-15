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

import template from './ProgramSensor.vue.js'
import Vue from 'vue'
import { ITermosMapping } from '../data/Things'
import { ITermosFunction, ITermosThermalPrograms } from '../data/Termos'
import { setBit } from './utils'
import ButtonDelete from '../widgets/ButtonDelete'
import OptionalNumber from '../widgets/OptionalNumber'
import SelectSensor from './SelectSensor'
import SelectOptionalSensor from './SelectOptionalSensor'
import SelectProgram from './SelectProgram'
import ToggleSwitch from '../widgets/ToggleSwitch'
import { faFire } from '@fortawesome/free-solid-svg-icons/faFire'
import { faSnowflake  } from '@fortawesome/free-solid-svg-icons/faSnowflake'

export default Vue.extend({
	...template,
	components: { ToggleSwitch, ButtonDelete, OptionalNumber, SelectSensor, SelectOptionalSensor, SelectProgram },
	props: {
		func: Object as () => ITermosFunction,
		mapping: Object as () => ITermosMapping | undefined,
		programs: Object as () => ITermosThermalPrograms,
	},
	data: function() {
		return {
			setBit,
			faFire,
			faSnowflake,
		}
	},
	computed: {
		progIDs: function(): string[] {
			return Object.keys(this.programs).sort()
		},
	},
})
