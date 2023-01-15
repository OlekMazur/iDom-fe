/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019 Aleksander Mazur
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

import template from './Now.vue.js'
import Vue from 'vue'
import { IPlacesThings } from '../data/Things'
import { INeighbourDevice, getNeighbours } from './neighbours'
import { storageLoadNumber, storageSaveNumber, storageDelete } from '../storage'
import NeighbourDevice from './NeighbourDevice'
import OptionalNumber from '../widgets/OptionalNumber'

export default Vue.extend({
	...template,
	components: { NeighbourDevice, OptionalNumber },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		const showAtOnce = storageLoadNumber('neighbourShowAtOnce')
		return {
			showAtOnce: isNaN(showAtOnce) ? undefined : showAtOnce,
		}
	},
	computed: {
		neighbours: function(): INeighbourDevice[] {
			return getNeighbours(this.placesThings, this.showAtOnce)
		},
	},
	watch: {
		showAtOnce: function(): void {
			if (this.showAtOnce === undefined) {
				storageDelete('neighbourShowAtOnce')
			} else {
				storageSaveNumber('neighbourShowAtOnce', this.showAtOnce)
			}
		},
	},
})
