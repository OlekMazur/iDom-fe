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

import template from './EditNumber.vue.js'
import Vue from 'vue'
import { strToInt, strToFloat, isRoundNumber } from '../utils'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'

export default Vue.extend({
	...template,
	props: {
		value: Number as () => number,
		min: Number as () => number,
		max: Number as () => number,
		step: Number as () => number,
	},
	data: function() {
		return {
			faSpinner,
			editing: false,
			focused: false,
			newValue: undefined as undefined | string,	// <input> uses and gives string
			width: 0,
		}
	},
	computed: {
		integers: function(): boolean {
			return this.step === undefined || isRoundNumber(this.step)
		},
	},
	methods: {
		begin: function() {
			if (isNaN(this.value))
				return
			this.width = (this.$refs.view as HTMLElement).offsetWidth + 26
			//console.log('begin', this.value, this.width)
			this.newValue = this.value.toString()
			this.editing = true
			this.$nextTick(this.focus)
		},
		focus: function() {
			//console.log('focus', this.$refs.input);
			(this.$refs.input as HTMLInputElement).focus()
		},
		commit: function() {
			if (this.editing && this.newValue !== undefined && this.newValue !== '') {
				//console.log('commit', this.newValue)
				let value = (this.integers ? strToInt : strToFloat)(this.newValue)
				if (value < this.min)
					value = this.min
				if (value > this.max)
					value = this.max
				this.$emit('input', value)
				this.editing = false
				this.focused = false
			}
		},
		rollback: function() {
			//console.log('rollback', this.newValue)
			this.editing = false
			this.focused = false
		},
	},
})
