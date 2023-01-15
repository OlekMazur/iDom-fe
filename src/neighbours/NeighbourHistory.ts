/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020 Aleksander Mazur
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

import template from './NeighbourHistory.vue.js'
import Vue from 'vue'
import { IHistoryEntry, IDeviceHistoryEntry } from '../data/History'
import { historyRegisterListenerNewest, historyUnregisterListener } from '../data/API'
import { IPlacesThings } from '../data/Things'
import {
	INeighbourDevice,
	INeighbourHistoryEntry,
	neighbourConvertHistory,
	neighbourCombineHistory,
} from './neighbours'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import HistoryTable from './HistoryTable'

interface IPartialHistory {
	listener: object
	history: INeighbourHistoryEntry[]
	waiting: boolean
}

interface IListeners {
	[place: string]: IPartialHistory
}

interface IData {
	faSpinner: IconDefinition
	/** Number of @c places entries having @c waiting = true. */
	waiting: number
	places: IListeners
	history: INeighbourHistoryEntry[]
}

export default Vue.extend({
	...template,
	components: { HistoryTable },
	props: {
		nd: Object as () => INeighbourDevice,
		cntMax: Number as () => number,
		placesThings: Object as () => IPlacesThings,
	},
	data: function(): IData {
		return {
			faSpinner,
			waiting: 0,
			places: {},
			history: [],
		}
	},
	watch: {
		nd: {
			immediate: true,
			handler: function(curr: INeighbourDevice, prev: INeighbourDevice) {
				if (curr && prev && curr.thing.name === prev.thing.name)
					return
				this.history = []
				this.refreshHistory()
			},
		},
		cntMax: {
			immediate: true,
			handler: function() {
				this.refreshHistory()
			},
		},
	},
	methods: {
		refreshHistory: function(start = true): void {
			//console.log('refreshHistory', start, this.cntMax, this.nd.thing.name)
			const oldListeners = this.places
			this.places = {}
			let waiting = 0

			for (const place in oldListeners)
				historyUnregisterListener(oldListeners[place].listener)

			if (start) {
				for (const place in this.nd.idAt) {
					const things = this.placesThings[place]
					if (!things)
						continue
					if (things.permissions && !things.permissions.history)
						continue

					const id = this.nd.idAt[place]
					const history: INeighbourHistoryEntry[] = oldListeners[place]
						? oldListeners[place].history
						: []
					this.places[place] = {
						history,
						listener: historyRegisterListenerNewest(
							place, 'neighbours', id,
							this.cntMax, this.historyCB),
						waiting: true,
					}
					waiting++
				}
			}

			this.waiting = waiting
		},
		historyCB: function(place: string, type: string, id: string, history: IHistoryEntry[]) {
			//console.log('historyCB', place, type, id, this.nd.thing.name, history.length)
			if (type !== 'neighbours' || !this.places[place])
				return

			const listener: IPartialHistory = this.places[place]
			if (listener.waiting) {
				listener.waiting = false
				this.waiting--
			}
			listener.history = neighbourConvertHistory(place, history as IDeviceHistoryEntry[])

			this.history = neighbourCombineHistory(
				Object.values(this.places)
				.map((partial: IPartialHistory) => partial.history),
			)
		},
	},
	destroyed: function() {
		this.refreshHistory(false)
	},
})
