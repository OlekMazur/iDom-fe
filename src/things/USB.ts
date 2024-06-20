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

import template from './USB.vue.js'
import Vue from 'vue'
import './USB.css'

interface IItem {
	type: string
	index: string
	speed: string
	label: string
	desc: string
	href?: string
}

export default Vue.extend({
	...template,
	props: {
		info: String as () => string,
	},
	computed: {
		items: function() {
			const result: IItem[] = []
			const tokens = this.info.split(' ')
			for (const str of tokens) {
				const token = str.split('=')
				if (token.length >= 2 && token[0].length >= 2 && 'BD'.indexOf(token[0][0]) >= 0) {
					const subtok = token[1].split(',')
					const item: IItem = {
						type: token[0][0] === 'B' ? 'bus' : 'dev',
						index: token[0].substring(1),
						speed: subtok[1],
						label: '',
						desc: '',
					}
					switch (item.type) {
						case 'bus':
							item.label = subtok[0]
							break
						case 'dev': {
							const ids = subtok[0].split('#', 2)
							const vidpid = ids[0].split(':', 3)
							if (vidpid.length === 2) {
								item.href = 'http://www.the-sz.com/products/usbid/index.php?v=' + vidpid[0] + '&p=' + vidpid[1]
							}
							item.label = ids[0]
							if (ids.length >= 1) {
								item.desc = ids[1]
							}
							break
						}
					}
					result.push(item)
				}
			}
			return result
		},
	},
})
