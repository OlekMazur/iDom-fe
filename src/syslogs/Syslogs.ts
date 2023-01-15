/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021 Aleksander Mazur
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

import template from './Syslogs.vue.js'
import Vue from 'vue'
import { IPlacesThings, getPermittedPlaces } from '../data/Things'
import { storageLoadBool, storageSaveBool } from '../storage'
import CollapseExpand from '../widgets/CollapseExpand'
import SyslogsAt from './SyslogsAt'

export default Vue.extend({
	...template,
	components: { CollapseExpand, SyslogsAt },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		const show: { [place: string]: boolean } = {}

		return {
			show,
		}
	},
	computed: {
		places: function(): string[] {
			return getPermittedPlaces(this.placesThings, 'logs').sort()
		},
	},
	methods: {
		showPlace: function(place: string, show: boolean): void {
			//console.log('showPlace', place, show)
			this.$set(this.show, place, show)
			storageSaveBool('syslogs.place.' + place + '.show', show)
		},
	},
	watch: {
		places: {
			immediate: true,
			handler: function(places: string[]): void {
				//console.log('watch', 'places', places, this.places)
				for (const place of places)
					if (!this.show[place])
						this.$set(this.show, place,
							storageLoadBool('syslogs.place.' + place + '.show', place === ''))
			},
		},
	},
})
