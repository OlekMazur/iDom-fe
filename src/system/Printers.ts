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

import template from './Printers.vue.js'
import Vue from 'vue'
import { ISystemInfoPrinters } from '../data/System'
import Printer, { IPrinterWithName } from './Printer'

export default Vue.extend({
	...template,
	components: { Printer },
	props: {
		data: Object as () => ISystemInfoPrinters,
	},
	computed: {
		items: function(): IPrinterWithName[] {
			const result: IPrinterWithName[] = []
			for (const name of Object.keys(this.data).sort())
				result.push({ name, ...this.data[name] })
			return result
		},
	},
})
