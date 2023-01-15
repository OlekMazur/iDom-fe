/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2020 Aleksander Mazur
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

import template from './ThingInfo.vue.js'
import Vue from 'vue'
import { historyRegisterOldestEntryListener, historyUnregisterOldestEntryListener } from '../data/API'
import { ThingType, IHistoryEntry } from '../data/History'
import { formatTS } from '../format'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import './ThingInfo.css'

export default Vue.extend({
	...template,
	props: {
		place: String as () => string,
		type: String as () => ThingType,
		id: String as () => string,
		posXEnd: Number as () => number,
		working: Boolean as () => boolean,
	},
	data: function() {
		return {
			listener: undefined as undefined | object,
			waiting: false,
			ts: undefined as undefined | number,
			refresh: {},

			faSpinner,
		}
	},
	computed: {
		tsStr: function(): string {
			return this.ts ? formatTS(this.ts) : '-'
		},
		clazz: function(): string {
			return this.working ? 'cloud-cell-working' : this.ts && this.ts < this.posXEnd ? 'cloud-cell-delete' : ''
		},
	},
	watch: {
		place: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'place', this.place)
				this.refresh = {}
			},
		},
		id: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'id', this.id)
				this.refresh = {}
			},
		},
		working: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'working', this.working)
				this.refresh = {}
			},
		},
		refresh: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'refresh', this.place, this.id, this.working)
				this.unregisterListener()
				if (!this.working && this.place !== undefined && this.id) {
					//console.log('registerListener', this.place, this.id)
					this.waiting = true
					this.listener = historyRegisterOldestEntryListener(
						this.place, this.type, this.id, this.historyCB)
				}
			},
		},
	},
	methods: {
		unregisterListener: function(): void {
			if (this.listener) {
				//console.log('unregisterListener', this.place, this.id)
				historyUnregisterOldestEntryListener(this.listener)
				this.listener = undefined
				this.waiting = true
				this.ts = undefined
			}
		},
		historyCB: function(place: string, type: string, id: string, history: IHistoryEntry[]) {
			//console.log('historyCB', place, type, id, history.length, history[0])
			//if (place !== this.place || id !== this.id)
			//	throw new Error('history listener mismatch: ' + place + ' vs. ' + this.place + ' and ' + id + ' vs. ' + this.id)
			this.waiting = false
			this.ts = history.length ? history[0].ts : undefined
		},
	},
	destroyed: function() {
		this.unregisterListener()
	},
})
