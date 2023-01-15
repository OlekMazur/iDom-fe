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

import template from './SelectProgram.vue.js'
import Vue from 'vue'

export default Vue.extend({
	...template,
	props: {
		value: String as () => string,
		options: Array as () => string[],
	},
	data: function() {
		return {
			editing: false,
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
			this.$nextTick(this.focus)
		},
		focus: function() {
			//console.log('focus', this.$refs.input);
			(this.$refs.input as HTMLInputElement).focus()
		},
		commit: function() {
			if (this.editing && this.newValue !== undefined) {
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
	},
})
