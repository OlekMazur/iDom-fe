/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021 Aleksander Mazur
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

import template from './Syslog.vue.js'
import Vue from 'vue'
import { ILogFile, orderLog } from '../data/API'
import { formatNumberWithUnit } from '../format'
import ToggleSwitch from '../widgets/ToggleSwitch'

export default Vue.extend({
	...template,
	components: { ToggleSwitch },
	props: {
		syslog: Object as () => ILogFile,
		permissionToOrder: Boolean as () => boolean,
		place: String as () => string,
	},
	computed: {
		size: function() {
			return formatNumberWithUnit(this.syslog.size, 'B', 1024)
		},
	},
	methods: {
		order: function(name: string, want: boolean): void {
			orderLog(this.place, name, want)
		},
	},
})
