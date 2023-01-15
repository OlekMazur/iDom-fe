/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2022 Aleksander Mazur
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

import template from './Media.vue.js'
import Vue from 'vue'
import { ISystemInfoMedia, ISystemInfoMount } from '../data/System'
import Medium, { IMediumWithName } from './Medium'

export default Vue.extend({
	...template,
	components: { Medium },
	props: {
		data: Object as () => ISystemInfoMedia,
		mount: Object as () => ISystemInfoMount,
	},
	computed: {
		mounts: function(): string[] {
			return Object.keys(this.mount).sort()
		},
		items: function(): IMediumWithName[] {
			const result: IMediumWithName[] = []
			for (const name of Object.keys(this.data).sort()) {
				const mounts: string[] = []
				for (const mount of this.mounts)
					if (this.mount[mount] == name)
						mounts.push(mount)
				result.push({ name, mounts, ...this.data[name] })
			}
			return result
		},
	},
})
