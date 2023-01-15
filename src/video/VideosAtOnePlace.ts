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

import template from './VideosAtOnePlace.vue.js'
import Vue from 'vue'
import { IThings, IDevices, IPermissions } from '../data/Things'
import { IVideo } from '../data/Video'
import {
	VideosRegisterListener, VideosUnregisterListener,
	getThingsIndexedByName,
} from '../data/API'
import VideoEntry from './VideoEntry'

interface IVideoIndex {
	[no: string]: IVideo
}

interface IVideoPlaceholder {
	no: number
}

type IVideoView = IVideo | IVideoPlaceholder

export default Vue.extend({
	...template,
	components: { VideoEntry },
	props: {
		place: String as () => string,
		things: Object as () => IThings,
		allPlay: Boolean as () => boolean,
		showAtOnce: Number as () => number,
		startFrom: Number as () => number,
		recMin: Number as () => number,
		updateTS: Number as () => number,
	},
	data: function() {
		return {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			query: undefined as any,
			videos: [] as IVideoView[],
			refresh: {},
		}
	},
	computed: {
		devices: function(): IDevices {
			//console.log('computed', 'devices')
			return getThingsIndexedByName(this.things && this.things.devices) as IDevices
		},
		permissions: function(): IPermissions | null | undefined {
			//console.log('computed', 'permissions', this.place)
			return this.things && this.things.permissions || undefined
		},
	},
	watch: {
		place: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'place', this.place, this.recMax)
				this.unregisterListener()
				this.videos = []
			},
		},
		startFrom: {
			immediate: true,
			handler: function() {
				this.refresh = {}
			},
		},
		showAtOnce: {
			immediate: true,
			handler: function() {
				this.refresh = {}
			},
		},
		updateTS: {
			immediate: true,
			handler: function() {
				this.refresh = {}
			},
		},
		refresh: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'refresh', this.updateTS, this.place, this.startFrom)
				this.unregisterListener()
				if (this.place !== undefined && !isNaN(this.startFrom)) {
					let recMin = this.startFrom - this.showAtOnce + 1
					if (recMin < this.recMin)
						recMin = this.recMin
					this.query = VideosRegisterListener(this.place, recMin, this.startFrom, this.videosCB)
				}
			},
		},
	},
	methods: {
		unregisterListener: function(): void {
			//console.log('unregisterListener')
			if (this.query) {
				VideosUnregisterListener(this.query)
				this.query = undefined
			}
		},
		videosCB: function(place: string, videos: IVideo[]): void {
			//console.log('videosCB', place, videos.length)
			if (place !== this.place)
				return

			const index: IVideoIndex = {}
			for (const video of videos)
				index[video.no] = video
			const result: IVideoView[] = []
			let recMin = this.startFrom - this.showAtOnce + 1
			if (recMin < this.recMin)
				recMin = this.recMin
			for (let no = this.startFrom; no >= recMin; no--)
				result.push(index[no] || { no })

			this.videos = result
		},
	},
	destroyed: function() {
		this.unregisterListener()
	},
})
