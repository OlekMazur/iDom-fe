/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020, 2022 Aleksander Mazur
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

import template from './History.vue.js'
import Vue from 'vue'
import { IPlacesThings, getPermittedPlaces } from '../data/Things'
import { INeighbourDevice, getNeighbours } from './neighbours'
import {
	storageLoadStr, storageSaveStr,
	storageLoadNumber, storageSaveNumber,
	storageDelete,
} from '../storage'
import TimeRangeSelRow from '../widgets/TimeRangeSelRow'
import CollapseExpand from '../widgets/CollapseExpand'
import EditNumber from '../widgets/EditNumber'
import OptionalNumber from '../widgets/OptionalNumber'
import ToggleSwitch from '../widgets/ToggleSwitch'
import NeighbourDevice from './NeighbourDevice'
import NeighbourHistory from './NeighbourHistory'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faBluetooth } from '@fortawesome/free-brands-svg-icons/faBluetooth'
import { faBroadcastTower } from '@fortawesome/free-solid-svg-icons/faBroadcastTower'
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import './neighbours.css'

interface IShowHistoryOf {
	[key: string]: boolean
}

interface INeighbourTypeIcon {
	icon: IconDefinition
	title: string
}

interface INeighbourTypeIcons {
	[type: string]: INeighbourTypeIcon
}

interface IData {
	showAtOnce?: number
	historyAtOnce: number
	history: IShowHistoryOf
	allPlacesExcluded: IShowHistoryOf
	typesExcluded: IShowHistoryOf
	typeIcons: INeighbourTypeIcons
	faBan: IconDefinition
}

const typeIcons: INeighbourTypeIcons = {
	'bt': {
		icon: faBluetooth,
		title: 'Urządzenia Bluetooth',
	},
	'bts': {
		icon: faBroadcastTower,
		title: 'Stacje bazowe telefonii komórkowej',
	},
	'tel': {
		icon: faPhone,
		title: 'Numery telefonów',
	},
}

export default Vue.extend({
	...template,
	components: {
		CollapseExpand,
		TimeRangeSelRow,
		NeighbourDevice,
		NeighbourHistory,
		EditNumber,
		OptionalNumber,
		ToggleSwitch,
	},
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function(): IData {
		const showAtOnce = storageLoadNumber('neighbourShowAtOnce')
		const historyAtOnce = storageLoadNumber('neighbourHistoryAtOnce')
		const allPlacesExcluded: IShowHistoryOf = {}
		const typesExcluded: IShowHistoryOf = {}
		for (const place of storageLoadStr('neighbourShowPlacesExcluded').split(','))
			if (place)
				allPlacesExcluded[place] = true
		for (const type of storageLoadStr('neighbourTypesExcluded').split(','))
			if (type)
				typesExcluded[type] = true

		return {
			showAtOnce: isNaN(showAtOnce) ? undefined : showAtOnce,
			historyAtOnce: isNaN(historyAtOnce) ? 10 : historyAtOnce,
			history: {},
			allPlacesExcluded,
			typesExcluded,
			typeIcons,
			faBan,
		}
	},
	computed: {
		places: function(): string[] {
			//return Object.keys(this.placesThings).sort()
			return getPermittedPlaces(this.placesThings, 'things').sort()
		},
		selectedPlaces: function(): string[] {
			const result: string[] = []
			for (const place of this.places)
				if (!this.allPlacesExcluded[place])
					result.push(place)
			return result
		},
		neighbours: function(): INeighbourDevice[] {
			return getNeighbours(this.placesThings, this.showAtOnce, this.selectedPlaces, this.typesExcluded)
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
		historyAtOnce: function(): void {
			storageSaveNumber('neighbourHistoryAtOnce', this.historyAtOnce)
		},
	},
	methods: {
		handleCollapseExpand: function(nd: INeighbourDevice, newState: boolean): void {
			const id = nd.place + '.' + nd.id
			this.$set(this.history, id, newState)
		},
		savePlacesExcluded: function(): void {
			const result: string[] = []
			for (const place in this.allPlacesExcluded)
				if (this.allPlacesExcluded[place])
					result.push(place)
			storageSaveStr('neighbourShowPlacesExcluded', result.join(','))
		},
		excludePlace: function(place: string, exclude: boolean): void {
			this.$set(this.allPlacesExcluded, place, exclude)
			this.savePlacesExcluded()
		},
		saveTypesExcluded: function(): void {
			const result: string[] = []
			for (const type in this.typesExcluded)
				if (this.typesExcluded[type])
					result.push(type)
			storageSaveStr('neighbourTypesExcluded', result.join(','))
		},
		excludeType: function(type: string, exclude: boolean): void {
			this.$set(this.typesExcluded, type, exclude)
			this.saveTypesExcluded()
		},
	},
})
