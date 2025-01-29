/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020, 2024 Aleksander Mazur
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

import template from './Audios.vue.js'
import Vue from 'vue'
import { storageLoadStr, storageSaveStr } from '../storage'
import { IAudios } from '../data/Audio'
import AudioEntry from './AudioEntry'

interface IAudioLabels {
	[audio: string]: string
}

export default Vue.extend({
	...template,
	components: { AudioEntry },
	props: {
		audios: Object as () => IAudios,
	},
	data: function() {
		return {
			audio: '',
			audioLabels: {} as IAudioLabels,
		}
	},
	computed: {
		audioList: function(): string[] {
			return this.audios && this.audios.record ? Object.keys(this.audios.record).sort() : []
		},
	},
	watch: {
		audioList: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'audios', this.audios, this.audio)
				const result: IAudioLabels = {}
				const reverse: IAudioLabels = {}
				for (const audio of this.audioList) {
					const caps = this.audios.record[audio]
					let label = ''
					if (typeof caps.tuner === 'object') {
						if (caps.tuner.card)
							label += caps.tuner.card
						if (caps.tuner.card && caps.tuner.bus_info)
							label += ' @ '
						if (caps.tuner.bus_info)
							label += caps.tuner.bus_info
					}
					if (!label && caps.name)
						label = caps.name
					if (!label)
						label = audio
					result[audio] = label
					reverse[label] = audio
				}
				this.audioLabels = result
				if (!this.audio || this.audioList.indexOf(this.audio) < 0)
					this.audio = reverse[storageLoadStr('audio', '')]
				if (!this.audio && this.audioList.length > 0)
					this.audio = this.audioList[0]
			},
		},
		audio: {
			//immediate: true,
			handler: function(value: string) {
				storageSaveStr('audio', this.audioLabels[value])
			},
		},
	},
})
