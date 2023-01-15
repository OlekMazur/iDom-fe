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

import template from './ThroughputIcon.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'

export interface IThroughputData {
	bytes: number
	packets: number
}

export default Vue.extend({
	...template,
	props: {
		icon: Object as () => IconDefinition,
		data: Object as () => IThroughputData,
	},
	data: function() {
		return {
			blink: '',
		}
	},
	watch: {
		data: function(newValue, oldValue) {
			this.blink = newValue.packets !== oldValue.packets || newValue.bytes !== oldValue.bytes ? 'blink' : ''
		},
	},
})
