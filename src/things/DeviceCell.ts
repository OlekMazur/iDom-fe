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

import template from './DeviceCell.vue.js'
import Vue from 'vue'
import DeviceButton from './DeviceButton'
import Timestamp from './Timestamp'
import { IDevice } from '../data/Things'

export default Vue.extend({
	...template,
	components: { DeviceButton, Timestamp },
	props: {
		place: String as () => string,
		id: String as () => string,
		ts: Number as () => number,
		thing: Object as () => IDevice,
		switchable: Boolean as () => boolean,
	},
	computed: {
		style: function(): string {
			if (!this.thing)
				return ''
			return !this.thing.state && this.thing.name && this.thing.name.split('/')[0] === 'termostat' ? 'blink' : ''
		},
	},
})
