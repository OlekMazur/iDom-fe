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

import template from './DeviceButton.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faToggleOn } from '@fortawesome/free-solid-svg-icons/faToggleOn'
import { faToggleOff } from '@fortawesome/free-solid-svg-icons/faToggleOff'
import { OperationSwitchDevice, ErrorMessage } from '../data/API'

export default Vue.extend({
	...template,
	props: {
		place: String as () => string,
		id: String as () => string,
		state: Boolean as () => boolean,
		want: Boolean as () => boolean | undefined,
		label: String as () => string,
		small: Boolean as () => boolean,
		switchable: Boolean as () => boolean,
	},
	data: function() {
		return {
			working: false,
		}
	},
	computed: {
		display: function(): string {
			if (this.small)
				return this.state ? 'Wyłącz' : 'Załącz'
			else
				return this.state ? 'ZAŁ.' : 'WYŁ.'
		},
		title: function(): string {
			if (this.want !== undefined)
				return 'Anuluj (zostaw jak jest)'
			else
				return this.state ? 'Wyłącz' : 'Załącz'
		},
		icon: function(): IconDefinition {
			return this.state ? faToggleOn : faToggleOff
		},
		style: function(): string {
			let result = 'button-' + (this.state ? 'on' : 'off')
			if (this.want !== undefined)
				result += ' blink'
			return result
		},
	},
	methods: {
		click: function(): void {
			if (this.want !== undefined ||
				confirm('Czy na pewno ' + (this.state ? 'wyłączyć' : 'załączyć') + ' urządzenie "' + this.label + '"?')) {
				this.working = true
				OperationSwitchDevice(this.place, this.id, this.want !== undefined ? null : !this.state)
				.catch((e) => {
					this.$alert(ErrorMessage(e))
				}).then(() => {
					this.working = false
				})
			}
		},
	},
})
