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

import template from './Network.vue.js'
import Vue from 'vue'
import { ISystemInfoNetwork } from '../data/System'
import NetIf, { INetIfWithName } from './NetIf'

function orderOfInterfaces(a: string, b: string) {
	const order = ['wwan0', 'ppp0', 'brint', 'eth0', 'wlan0']
	const aIndex = order.indexOf(a)
	const bIndex = order.indexOf(b)
	if (aIndex !== bIndex)
		return aIndex - bIndex
	if (a < b)
		return -1
	if (a > b)
		return +1
	return 0
}

export default Vue.extend({
	...template,
	components: { NetIf },
	props: {
		data: Object as () => ISystemInfoNetwork,
		uptime: Number as () => number,
	},
	computed: {
		items: function(): INetIfWithName[] {
			const result: INetIfWithName[] = []
			for (const name of Object.keys(this.data).sort(orderOfInterfaces))
				result.push({ name, ...this.data[name] })
			return result
		},
	},
})
