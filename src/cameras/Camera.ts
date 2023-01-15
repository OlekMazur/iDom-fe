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

import template from './Camera.vue.js'
import Vue from 'vue'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
import { IDevice, IPermissions } from '../data/Things'
import { IYUVFrame, DefaultCameraConfig, ICameraConfig } from '../data/Camera'
import { QueryCameraFrame,  QueryCameraConfig, QueryCameraMask } from '../data/API'
import { IPBM, LoadPBM } from '../data/PBM'
import { storageLoadBool, storageSaveBool } from '../storage'
import SensorDeviceForm from '../things/SensorDeviceForm'
import CameraForm from './CameraForm'
import { DrawYUVOnCanvas, IFrameDiffInfo } from './FrameCanvas'

export default Vue.extend({
	...template,
	components: { SensorDeviceForm, CameraForm },
	props: {
		place: String as () => string,
		id: String as () => string,
		permissions: Object as () => IPermissions,
		data: Object as () => IDevice,
	},
	data: function() {
		return {
			faPlay,
			faStop,
			faSpinner,
			faEye,
			faEyeSlash,
			wantPlay: undefined as undefined | boolean,
			isPlaying: false,
			boost: true,
			framesReady: false,
			config: DefaultCameraConfig,
			mask: undefined as undefined | IPBM,
			framePrev: undefined as undefined | IYUVFrame,
			diff: undefined as undefined | IFrameDiffInfo,
			fps: undefined as undefined | number,
		}
	},
	mounted: function() {
		this.boost = storageLoadBool('videoBoost.' + this.globalID, true)

		QueryCameraConfig(this.place, this.camID, 'TODO')
		.then((config: ICameraConfig) => {
			this.config = config
		}).catch((e: Error) => {
			console.log(e)
		})

		QueryCameraMask(this.place, this.camID, 'TODO')
		.then(LoadPBM)
		.then((mask: IPBM) => {
			this.mask = mask
		}).catch((e: Error) => {
			console.log(e)
		})

		this.framePrev = undefined
	},
	destroyed: function() {
		this.wantPlay = false
		this.framePrev = undefined
		this.framesReady = false
		this.fps = undefined
	},
	watch: {
		wantPlay: function(): void {
			//console.log('watch wantPlay', this.wantPlay, this.isPlaying)
			if (this.wantPlay === this.isPlaying)
				return
			if (this.wantPlay)
				this.getFrame()
		},
		boost: function(): void {
			storageSaveBool('videoBoost.' + this.globalID, this.boost)
		},
		working: {
			immediate: true,
			handler: function(): void {
				//console.log('watch working', this.working, this.wantPlay)
				if (this.working) {
					if (this.wantPlay === undefined)
						this.wantPlay = true
				} else {
					this.wantPlay = false
				}
			},
		},
	},
	computed: {
		camID: function(): string {
			return this.data.name ? this.data.name.split('/', 2)[1] : ''
		},
		globalID: function(): string {
			return this.place + '.' + this.camID
		},
		working: function(): boolean {
			//console.log('computed working', this.data.state)
			return this.data.state
		},
		switchable: function(): boolean {
			return this.permissions ? !!this.permissions.device : true
		},
	},
	methods: {
		getFrame: function(): void {
			QueryCameraFrame(this.place, this.camID)
			.then((frame: IYUVFrame) => {
				this.diff = DrawYUVOnCanvas(this.config,
					frame, this.$refs.canvas as HTMLCanvasElement,
					this.boost,
					this.mask,
					this.framePrev, this.$refs.canvas2 as HTMLCanvasElement)
				if (this.framePrev) {
					this.framesReady = true
					const deltaTS = frame && frame.ts !== undefined && this.framePrev.ts !== undefined
						? frame.ts - this.framePrev.ts : 0
					this.fps = deltaTS > 0 ? 1 / deltaTS : undefined
				} else {
					this.fps = undefined
				}
				if (this.wantPlay) {
					this.isPlaying = true
					this.getFrame()
					this.framePrev = frame
				} else {
					this.isPlaying = false
				}
			}).catch((e) => {
				console.error(e)
				this.isPlaying = false
				this.wantPlay = false
			})
		},
	},
})
