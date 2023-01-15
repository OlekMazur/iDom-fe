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

import template from './CameraForm.vue.js'
import Vue from 'vue'
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { formatRealNumber } from '../format'
import { ICameraConfig } from '../data/Camera'
import { IFrameDiffInfo } from './FrameCanvas'
import DeviceButton from '../things/DeviceButton'
import './CameraForm.css'

export default Vue.extend({
	...template,
	components: { DeviceButton },
	props: {
		place: String as () => string,
		id: String as () => string,
		name: String as () => string,
		alias: String as () => string,
		state: Boolean as () => boolean,
		want: Boolean as () => boolean | undefined,
		switchable: Boolean as () => boolean,
		config: Object as () => ICameraConfig | undefined,
		diff: Object as () => IFrameDiffInfo | undefined,
		fps: Number as () => number,
	},
	data: function() {
		return {
			faSave,
			faTimes,
			formVisible: false,
			working: false,
		}
	},
	computed: {
		diffs: function(): string[] | undefined {
			if (this.diff && this.diff.plane.length === 3) {
				const result = []
				for (const info of this.diff.plane) {
					result.push(info.changed + ' > ' + info.threshold + ' (' + info.total + ')')
				}
				return result
			}
			return
		},
		md: function(): boolean[] | undefined {
			if (this.diff && this.diff.plane.length === 3) {
				const result = []
				for (const info of this.diff.plane) {
					result.push(info.changed > info.threshold)
				}
				return result
			}
			return
		},
		fpsFormatted: function(): string {
			return formatRealNumber(this.fps)
		},
	},
	methods: {
		showForm: function() {
			this.formVisible = true
		},
	},
})
