/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021, 2024 Aleksander Mazur
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

import template from './VideoEntry.vue.js'
import Vue from 'vue'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faHandPaper } from '@fortawesome/free-solid-svg-icons/faHandPaper'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { IVideo } from '../data/Video'
import { IThings, IPermissions } from '../data/Things'
import { storageLoadBool } from '../storage'
import { VIDEO_WANT_TN } from '../config'
import { formatTS, formatNumberWithUnit } from '../format'
import { getVideoTNURL, getVideoURL, orderVideo, orderVideoTNUpTo } from '../data/API'
import { DrawImageOnCanvas } from './FrameCanvas'
import EditNumber from '../widgets/EditNumber'

export default Vue.extend({
	...template,
	components: { EditNumber },
	props: {
		place: String as () => string,
		showPlace: Boolean as () => boolean,
		things: Object as () => IThings | undefined,
		permissions: Object as () => IPermissions | undefined,
		video: Object as () => IVideo,
		allPlay: Boolean as () => boolean,
	},
	data: function() {
		return {
			faPlay,
			faHandPaper,
			faPause,
			faEnvelope,
			faPlus,
			faSpinner,

			frame: undefined as undefined | number,
			imgURL: '',
			play: false,
			timeoutID: undefined as undefined | number,
			imgReady: false,
		}
	},
	computed: {
		ts: function(): string {
			return this.video.ts ? formatTS(this.video.ts) : ''
		},
		size: function(): string {
			return this.video.size ? formatNumberWithUnit(this.video.size / 1024 / 1024, 'B', 1024, 2) : ''
		},
		url: function(): string {
			return this.video.ext ? getVideoURL(this.place, this.video.no, this.video.ext) : ''
		},
		where: function(): string {
			if (!this.showPlace)
				return ''
			const alias = this.things && this.things.alias || this.place
			return alias && ' @' + alias || ''
		},
		cam: function(): string {
			const cam = this.things && this.things.devices && this.video.cam && this.things.devices[this.video.cam] || undefined
			return (cam && cam.alias || this.video.cam || '') + this.where
		},
		boost: function(): boolean {
			return storageLoadBool('videoBoost.' + this.place + '.' + this.video.cam, true)
		},
	},
	watch: {
		video: {
			immediate: true,
			handler: function() {
				if (!this.imgReady &&
					this.video.ext && (
					(!this.showPlace && this.video.hasTN === undefined) ||
					(this.video.hasTN !== undefined && this.video.hasTN >= 1))) {
					this.frame = 1
				}
			},
		},
		frame: {
			immediate: true,
			handler: function() {
				this.loadImage()
			},
		},
		allPlay: {
			immediate: true,
			handler: function(newPlay: boolean, oldPlay: boolean) {
				if (newPlay && !oldPlay && !this.play)
					this.playPause()
			},
		},
	},
	methods: {
		playPause: function(): void {
			this.cancelTimeout()
			this.play = !this.play
			if (this.play)
				this.loadNext()
		},
		loadImage: function(): void {
			if (this.frame === undefined)
				return
			//console.log('loadImage', this.place, this.video.no, this.frame)
			this.imgURL = getVideoTNURL(this.place, this.video.no, this.frame)
		},
		imgLoaded: function(): void {
			//console.log('imgLoaded', this.frame)
			if (DrawImageOnCanvas(this.$refs.canvas as HTMLCanvasElement, this.$refs.img as HTMLImageElement, this.boost))
				this.imgReady = true

			if (this.play) {
				this.cancelTimeout()
				this.timeoutID = window.setTimeout(this.frame === this.video.hasTN ? this.rewind : this.loadNext, 100)
			}
		},
		imgFailed: function(): void {
			//console.log('imgFailed', this.frame)
			this.imgURL = ''
			this.rewind()
		},
		rewind: function(): void {
			//console.log('rewind', this.frame)
			if (this.frame) {
				this.frame = 0
			} else {
				this.cancelTimeout()
				this.timeoutID = window.setTimeout(() => this.loadImage(), 10000)
			}
			this.play = false
		},
		loadNext: function(): void {
			if (this.frame === undefined)
				return
			this.timeoutID = undefined
			if (this.video.hasTN === undefined || this.frame < this.video.hasTN)
				this.frame++
			else
				this.frame = 0
		},
		cancelTimeout: function(): void {
			if (this.timeoutID !== undefined) {
				window.clearTimeout(this.timeoutID)
				this.timeoutID = undefined
			}
		},
		clickURL: function(e: Event): void {
			if (!this.url) {
				e.preventDefault()
				if (this.video && confirm('Czy na pewno zamówić wysyłkę nagrania '
					+ this.video.no + '.' + this.video.ext
					+ ' o wielkości ' + this.video.size + ' B?'))
					orderVideo(this.place, this.video, true)
			}
		},
		cancelOrder: function(): void {
			orderVideo(this.place, this.video, false)
		},
		setWantTN: function(wantTN: boolean): void {
			let arg: number | undefined
			if (wantTN) {
				arg = VIDEO_WANT_TN
				if (this.video.hasTN !== undefined)
					arg += this.video.hasTN
			}
			orderVideoTNUpTo(this.place, this.video, arg)
		},
	},
	destroyed: function() {
		this.cancelTimeout()
	},
})
