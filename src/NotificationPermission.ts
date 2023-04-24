/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2023 Aleksander Mazur
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

import template from './NotificationPermission.vue.js'
import Vue from 'vue'
import { faComment } from '@fortawesome/free-solid-svg-icons/faComment'
import { NotificationHub } from './notification'

export default Vue.extend({
	...template,
	props: {
		nh: NotificationHub,
	},
	data: function() {
		return {
			supported: this.nh && this.nh.supported,
			granted: this.nh && this.nh.isGranted(),
			icon: faComment,
		}
	},
	methods: {
		click: function(): void {
			this.nh && this.nh.requestPermission().then(() => {
				this.granted = true
			}).catch((e) => {
				console.log(e)
			})
		},
	},
})
