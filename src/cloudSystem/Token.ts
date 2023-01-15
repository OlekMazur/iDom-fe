/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2022 Aleksander Mazur
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

import template from './Token.vue.js'
import Vue from 'vue'
import { queryIdToken } from '../data/cloud/Setup'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'

export default Vue.extend({
	...template,
	data: function() {
		return {
			token: '',
			updatePromise: undefined as undefined | Promise<void>,
			error: '',
			faSpinner,
			faExclamationTriangle,
		}
	},
	created: function() {
		this.update()
	},
	methods: {
		update: function(): void {
			if (this.updatePromise !== undefined)
				return
			this.updatePromise = queryIdToken()
			.then(this.updateSuccess)
			.catch(this.updateFailed)
		},
		updateSuccess: function(token: string): void {
			console.info('TOKEN', token)
			this.token = token
			this.error = ''
			this.updatePromise = undefined
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		updateFailed: function(e: any): void {
			console.warn('TOKEN', e)
			this.token = ''
			this.error = e.toString()
			this.updatePromise = undefined
		},
	},
})
