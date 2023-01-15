/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2022 Aleksander Mazur
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

import template from './Sync.vue.js'
import Vue from 'vue'
import { getSyncVarURL } from '../data/API'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { faFile } from '@fortawesome/free-solid-svg-icons/faFile'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'

export default Vue.extend({
	...template,
	props: {
		place: String as () => string,
		name: String as () => string,
		info: String as () => string,
	},
	data: function() {
		return {
			url: '',
			title: '',
			icon: faExclamationTriangle,
		}
	},
	watch: {
		info: {
			immediate: true,
			handler: function(): void {
				this.url = ''
				if (!this.info) {
					this.icon = faTrash
					this.title = 'Plik został skasowany'
				} else if (this.info === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') {
					this.icon = faBan
					this.title = 'Plik istnieje, ale jest pusty'
				} else if (/^[0-9a-f]{64}$/.test(this.info)) {
					this.icon =  faFile
					this.title = this.info
					this.url = getSyncVarURL(this.place, this.name, this.info)
				} else {
					this.icon = faExclamationTriangle
					this.title = 'Coś poszło nie tak'
				}
			},
		},
	},
})
