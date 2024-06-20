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

import template from './VideosAtAllPlaces.vue.js'
import Vue from 'vue'
import { IPlacesThings, IThings, IPermissions } from '../data/Things'
import { IVideo } from '../data/Video'
import { NewestVideosRegisterListener, NewestVideosUnregisterListener } from '../data/API'
import VideoEntry from './VideoEntry'

interface IVideoExt extends IVideo {
	place: string
	things?: IThings | null
	permissions?: IPermissions | null
}

interface IPlaceData {
	listener: object
	videos: IVideoExt[]
	waiting: boolean
}

interface IPlacesData {
	[place: string]: IPlaceData
}

interface IData {
	placesData: IPlacesData
	waiting: number
	refresh: object
}

function cmpVideos(a: IVideoExt, b: IVideoExt): number {
	return b.ts - a.ts
}

export default Vue.extend({
	...template,
	components: { VideoEntry },
	props: {
		placesThings: Object as () => IPlacesThings,
		places: Array as () => string[],
		allPlay: Boolean as () => boolean,
		showAtOnce: Number as () => number,
	},
	data: function(): IData {
		return {
			placesData: {},
			waiting: 0,
			refresh: {},
		}
	},
	computed: {
		videos: function(): IVideoExt[] {
			let result: IVideoExt[] = []

			for (const place in this.placesData)
				if (!this.placesData[place].waiting)
					result = result.concat(this.placesData[place].videos)

			result.sort(cmpVideos)
			return result.slice(0, this.showAtOnce)
		},
	},
	watch: {
		places: {
			immediate: true,
			handler: function(): void {
				//console.log('watch', 'places', this.places && this.places.length)
				this.refresh = {}
			},
		},
		showAtOnce: {
			immediate: true,
			handler: function(): void {
				//console.log('watch', 'showAtOnce')
				this.unregisterListeners()
				this.refresh = {}
			},
		},
		refresh: {
			immediate: true,
			handler: function(): void {
				//console.log('watch', 'refresh')
				if (this.showAtOnce)
					this.registerListeners()
			},
		},
	},
	methods: {
		registerListeners: function(): void {
			for (const place in this.placesData)
				if (this.placesData[place] && !this.places.includes(place)) {
					//console.log('register videos ---', place)
					const placeData = this.placesData[place]
					NewestVideosUnregisterListener(placeData.listener)
					if (placeData.waiting)
						this.waiting--
					this.$delete(this.placesData, place)
				}

			for (const place of this.places)
				if (!this.placesData[place]) {
					//console.log('register videos +++', place)
					this.$set(this.placesData, place, {
						listener: NewestVideosRegisterListener(place, this.showAtOnce, this.videosCB),
						videos: [],
						waiting: true,
					})
					this.waiting++
				}
		},
		videosCB: function(place: string, videos: IVideo[]): void {
			//console.log('videosCB', place, videos.length)
			if (!this.placesData[place])
				return

			const things = this.placesThings[place]
			const permissions = things && things.permissions

			const result: IVideoExt[] = []
			for (const video of videos)
				result.push({
					...video,
					place,
					things,
					permissions,
				})

			const placeData = this.placesData[place]
			placeData.videos = result
			if (placeData.waiting) {
				placeData.waiting = false
				this.waiting--
			}
		},
		unregisterListeners: function(): void {
			for (const place in this.placesData) {
				//console.log('unregister videos ---', place)
				NewestVideosUnregisterListener(this.placesData[place].listener)
			}
			this.placesData = {}
			this.waiting = 0
		},
	},
	destroyed: function() {
		this.unregisterListeners()
	},
})
