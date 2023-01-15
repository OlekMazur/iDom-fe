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

import template from './status.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faUnlink } from '@fortawesome/free-solid-svg-icons/faUnlink'
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt'
import { DataStatus } from './data/API'
import cloud from './data/cloud/Setup'

declare const VARIANT: string

export default Vue.extend({
	...template,
	props: {
		status: String as () => DataStatus,
		message: String,
	},
	computed: {
		icon: function(): IconDefinition | null {
			if (this.status === 'ok')
				return faLink
			if (this.status === 'working')
				return faSpinner
			if (this.status === 'timeout')
				return faUnlink
			if (this.status === 'error')
				return faExclamationTriangle
			if (this.status === 'auth')
				return faSignInAlt
			return null
		},
		pulse: function(): boolean {
			return this.status === 'working'
		},
		style: function(): string {
			return this.status === 'error' || this.status === 'timeout' || this.status === 'auth' ? 'blink' : ''
		},
		title: function(): string {
			if (VARIANT === 'cloud') {
				switch (this.status) {
					case 'auth':
						return 'Zaloguj'
					case 'ok':
					case 'working':
						return 'Wyloguj'
				}
			}
			return this.message
		},
	},
	methods: {
		click: function(): void {
			if (VARIANT === 'cloud') {
				switch (this.status) {
					case 'auth':
						cloud.signIn()
						break
					case 'ok':
					case 'working':
						cloud.signOut()
						break
				}
			}
		},
	},
})
