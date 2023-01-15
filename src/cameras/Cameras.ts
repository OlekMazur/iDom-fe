/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020 Aleksander Mazur
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

import template from './Cameras.vue.js'
import Vue from 'vue'
import { IPlacesThings, IDevice } from '../data/Things'
import { orderByNameAsc } from '../sort'
import Camera from './Camera'

interface ICameraAtPlace extends IDevice {
	place: string
	id: string
}

function cameraCmp(a: ICameraAtPlace, b: ICameraAtPlace): number {
	return orderByNameAsc(a.name, b.name)
}

export default Vue.extend({
	...template,
	components: { Camera },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	computed: {
		cameras: function() {
			const result: ICameraAtPlace[] = []
			for (const place in this.placesThings) {
				const things = this.placesThings[place]
				if (things && things.devices)
					for (const id in things.devices) {
						const device = things.devices[id]
						if (device.name && device.name.split('/')[0] === 'video')
							result.push({
								place,
								id,
								...device,
							})
					}
			}
			result.sort(cameraCmp)
			return result
		},
	},
})
