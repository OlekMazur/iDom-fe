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

import template from './SelectSensor.vue.js'
import Vue from 'vue'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { ITermosMapping, describeSensor } from '../data/Things'

export default Vue.extend({
	...template,
	props: {
		value: String as () => string,
		mapping: Object as () => ITermosMapping | undefined,
	},
	data: function() {
		return {
			faSpinner,
			editing: false,
			custom: false,
			focused: false,
			newValue: undefined as undefined | string,
			width: 0,
		}
	},
	methods: {
		begin: function() {
			this.width = (this.$refs.view as HTMLElement).offsetWidth + 26
			//console.log('begin', this.value, this.width)
			this.newValue = this.value
			this.editing = true
			this.custom = !this.mapping
			this.$nextTick(this.focus)
		},
		focus: function() {
			//console.log('focus', this.$refs.input);
			(this.$refs.input as HTMLInputElement).focus()
		},
		commit: function() {
			if (this.editing && this.newValue !== undefined && this.newValue !== '') {
				//console.log('commit', this.newValue)
				this.$emit('input', this.newValue)
				this.editing = false
				this.focused = false
			}
		},
		rollback: function() {
			//console.log('rollback', this.newValue)
			this.editing = false
			this.focused = false
		},
		describeSensor: function(id: string): string {
			return describeSensor(this.mapping, id)
		},
		selectChange: function(id: string): void {
			//console.log('selectChange', id)
			if (id === '') {
				this.newValue = this.value
				this.custom = true
				this.$nextTick(this.focus)
			}
		},
	},
})
