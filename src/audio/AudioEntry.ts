/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020, 2021, 2022 Aleksander Mazur
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

import template from './AudioEntry.vue.js'
import Vue from 'vue'
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons/faVolumeUp'
import { faVolumeMute } from '@fortawesome/free-solid-svg-icons/faVolumeMute'
import { faFileExport } from '@fortawesome/free-solid-svg-icons/faFileExport'
import { faFileImport } from '@fortawesome/free-solid-svg-icons/faFileImport'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'
import { strToFloat } from '../utils'
import { storageLoadStr, storageSaveStr, storageDelete } from '../storage'
import { IRecordCaps, IPlaybackDevices } from '../data/Audio'
import { IAudioStatus,
	localAudioStatus, localRadioTune, localAudioCtl, localAudioStreamURL,
} from '../data/local/Audio'
import { ErrorMessage } from '../data/API'
import EditNumber from '../widgets/EditNumber'
import EditString from '../widgets/EditString'
import ButtonAdd from '../widgets/ButtonAdd'
import ButtonDelete from '../widgets/ButtonDelete'
import './AudioEntry.css'

/**************************************/

const STORAGE_KEY = 'radioChannels'

const channelKeyMapImport = (x: string): number => parseInt(x, 10) / 1000000

const channelKeyMapExport = (x: number): string => (x * 1000000).toString()

function channelsImport(str: string[]): number[] {
	return str
	.map(channelKeyMapImport)
	.filter((x) => !isNaN(x))
}

function channelsLoad(): number[] {
	try {
		const str = storageLoadStr(STORAGE_KEY)
		if (str)
			return channelsImport(str.split(','))
	} catch (_e) {
	}
	return []
}

function channelsSave(channels: number[]): void {
	storageSaveStr(STORAGE_KEY, channels.map(channelKeyMapExport).join(','))
}

interface IChannelNames {
	[freq: string]: string
}

function channelNamesLoad(channels: number[]): IChannelNames {
	const result: IChannelNames = {}
	for (const freq of channels) {
		const str = storageLoadStr(STORAGE_KEY + '.' + freq)
		if (str)
			result[freq] = str
	}
	return result
}

function channelNameSave(freq: number, name?: string): void {
	const key = STORAGE_KEY + '.' + freq
	if (name !== undefined) {
		storageSaveStr(key, name)
	} else {
		storageDelete(key)
	}
}

const getUrlSfx = (): string => '?_=' + Date.now().toString()

function killAudio(audio?: HTMLAudioElement): void {
	// workaround for firefox - it keeps downloading data despite <audio> is removed from DOM
	if (audio) {
		audio.pause()
		audio.src = ''
	}
}

interface IRadiosSerialized {
	[freq: string]: string
}

function radiosSerialize(channels: number[], names: IChannelNames): string {
	const serialized: IRadiosSerialized = {}
	for (const freq of channels) {
		serialized[freq * 1000000] = names[freq] || ''
	}
	return JSON.stringify(serialized)
}

interface IAudioLabels {
	[audio: string]: string
}

/**************************************/

export default Vue.extend({
	...template,
	components: { EditNumber, EditString, ButtonAdd, ButtonDelete },
	props: {
		audio: String as () => string,
		caps: Object as () => IRecordCaps,
		playbackDevices: Object as () => IPlaybackDevices,
	},
	data: function() {
		const channels = channelsLoad()
		const channelNames = channelNamesLoad(channels)

		return {
			faVolumeUp,
			faVolumeMute,
			faFileExport,
			faFileImport,
			faArrowLeft,
			faArrowRight,

			working: false,
			freqMin: 87.5,
			freqMax: 108,
			maxSignal: 0xFFFF,
			promise: undefined as undefined | Promise<void>,
			timer: undefined as undefined | number,
			channels,
			channelNames,
			frequency: NaN,
			wantFreq: NaN,
			signal: NaN,
			afc: NaN,
			clients: NaN,
			softvol_a256: NaN,
			softvol_b: NaN,
			fakerate: NaN,
			error: '',
			errorTune: '',
			loopback: '',	// aktualnie używane urządzenie loopback playback
			playback: '',	// wybrane w polu <select> urządzenie loopback playback
			urlSfx: getUrlSfx(),
			lastTuned: 0,
			isDestroyed: false,
			recovery: false,
			recoveryTimer: undefined as undefined | number,
		}
	},
	beforeDestroy: function() {
		this.recovery = false
		killAudio(this.$refs.audio as HTMLAudioElement)
		this.isDestroyed = true
	},
	destroyed: function() {
		this.cancelRecoveryTimer()
		this.cancelTimer()
	},
	computed: {
		audioURL: function(): string {
			return this.audio && this.urlSfx ? localAudioStreamURL(this.audio) + this.urlSfx : ''
		},
		audioList: function(): string[] {
			const result: string[] = []
			if (this.playbackDevices)
				for (const playback in this.playbackDevices)
					if (playback !== this.audio)
						result.push(playback)
			result.sort()
			return result
		},
		audioLabels: function(): IAudioLabels {
			const result: IAudioLabels = {}
			for (const audio of this.audioList) {
				const caps = this.playbackDevices[audio]
				result[audio] = caps && caps.name || audio
			}
			return result
		},
	},
	watch: {
		caps: {
			immediate: true,
			handler: function() {
				if (this.caps && typeof this.caps.tuner === 'object') {
					const caps = this.caps.tuner
					this.maxSignal = caps.driver === 'saa7134' ? 0x8000 : 0xFFFF

					if (Array.isArray(caps.bands)) {
						let freqMin = NaN
						let freqMax = NaN

						for (const band of caps.bands) {
							if (isNaN(freqMin) || freqMin > band.min)
								freqMin = band.min
							if (isNaN(freqMax) || freqMax > band.max)
								freqMax = band.max
						}

						this.freqMin = freqMin / 1000000
						this.freqMax = freqMax / 1000000
					}
				}
			},
		},
		audio: {
			immediate: true,
			handler: function() {
				this.recovery = false
				killAudio(this.$refs.audio as HTMLAudioElement)
				this.cancelTimer()
				this.cancelRecoveryTimer()
				this.refreshStatus()
				this.urlSfx = getUrlSfx()
			},
		},
		audioList: {
			immediate: true,
			handler: function() {
				if (this.audioList && this.audioList.length && !(this.playback && this.audioList.includes(this.playback)))
					this.playback = this.audioList[0]
			},
		},
		/* interferes with this.recover()
		audioURL: {
			immediate: true,
			handler: function() {
				this.recovery = false
			},
		},
		*/
	},
	methods: {
		cancelTimer: function(): void {
			if (this.timer !== undefined) {
				window.clearTimeout(this.timer)
				this.timer = undefined
			}
		},
		refreshStatus: function(): void {
			//console.log('refreshStatus')
			if (!this.audio)
				return
			this.cancelTimer()
			this.promise = localAudioStatus(this.audio)
			.then((status: IAudioStatus) => {
				//console.log('refreshStatus', status)
				if (status.radio) {
					const data = status.radio
					this.frequency = data.frequency / 1000000
					this.signal = Math.round(data.signal * 100 / this.maxSignal)
					this.afc = data.afc / 1000
					this.error = data.error || ''
				} else {
					this.frequency = this.signal = this.afc = NaN
					this.error = ''
				}
				if (status.audio) {
					const data = status.audio
					this.loopback = data.playback || ''
					if (this.loopback)
						this.playback = this.loopback
					this.clients = data.clients
					this.softvol_a256 = data.a
					this.softvol_b = data.b
					this.fakerate = data.rate
				} else {
					this.loopback = ''
					this.clients = NaN
					this.softvol_a256 = NaN
					this.softvol_b = NaN
					this.fakerate = NaN
				}
			}).catch((e) => {
				this.error = ErrorMessage(e)
			}).then(() => {
				this.working = false
				this.doOpFinish(500)
			})
		},
		refreshStatusTimeout: function(): void {
			//console.log('refreshStatusTimeout')
			this.timer = undefined
			this.refreshStatus()
		},
		setFrequency: function(freq: string): void {
			//console.log('setFrequency', freq)
			this.working = true
			this.cancelTimer()
			this.cancelRecoveryTimer()
			this.wantFreq = strToFloat(freq)
			if (this.promise)
				this.promise.then(() => this.doSetFrequency())
			else
				this.promise = this.doSetFrequency()
		},
		doSetFrequency: function(): Promise<void> {
			//console.log('doSetFrequency', this.frequency)
			const now = (new Date()).getTime()
			const restartAudio = now - this.lastTuned >= 8000	// 8s
			this.lastTuned = now
			if (restartAudio) {
				this.recovery = false
				this.urlSfx = ''	// stop
				killAudio(this.$refs.audio as HTMLAudioElement)
			}

			this.working = true
			this.cancelTimer()
			return localRadioTune(this.audio, this.wantFreq * 1000000)
			.then(() => {
				//console.log('doSetFrequency', this.frequency, 'OK')
				this.frequency = this.wantFreq
				this.errorTune = ''
				if (restartAudio) {
					this.recovery = false
					this.urlSfx = getUrlSfx()	// play
				}
			}).catch((e) => {
				this.errorTune = ErrorMessage(e)
			}).then(this.setOpFinish)
		},
		audioCtl: function(op: string, arg?: string): void {
			//console.log('audioCtl', op, arg)
			this.working = true
			this.cancelTimer()
			if (this.promise)
				this.promise.then(() => this.doAudioCtl(op, arg))
			else
				this.promise = this.doAudioCtl(op, arg)
		},
		doAudioCtl: function(op: string, arg?: string): Promise<void> {
			//console.log('doAudioCtl', op, arg)
			this.cancelTimer()
			this.working = true
			return localAudioCtl(this.audio, op, arg)
			.then(() => {
				//console.log('doAudioCtl', op, arg, 'OK')
				this.errorTune = ''
			}).catch((e) => {
				this.errorTune = ErrorMessage(e)
			}).then(this.setOpFinish)
		},
		setOpFinish: function(): void {
			this.doOpFinish(200)
		},
		doOpFinish: function(timeout: number): void {
			if (!this.isDestroyed) {
				this.cancelTimer()
				this.timer = window.setTimeout(this.refreshStatusTimeout, timeout)
				this.promise = undefined
			}
		},
		setSoftVol: function(a256: number, b: number): void {
			let arg = ''
			arg += a256
			if (b >= 0)
				arg += '+'
			arg += b
			this.audioCtl('vol', arg)
		},
		setSoftVolA256: function(x: number): void {
			this.setSoftVol(x, this.softvol_b)
		},
		setSoftVolB: function(x: number): void {
			this.setSoftVol(this.softvol_a256, x)
		},
		addChannel: function(): void {
			//console.log('addChannel', this.frequency)
			let i = this.channels.length
			for (; i > 0; i--) {
				const freq = this.channels[i - 1]
				if (freq === this.frequency)
					return
				else if (freq < this.frequency)
					break
			}
			const left = this.channels.slice(0, i)
			const right = this.channels.slice(i)
			left.push(this.frequency)
			this.channels = left.concat(right)
			channelsSave(this.channels)
		},
		delChannel: function(frequency: number, index: number): void {
			//console.log('delChannel', frequency, index, this.channels[index])
			this.$delete(this.channelNames, frequency)
			channelNameSave(frequency)
			this.channels.splice(index, 1)
			channelsSave(this.channels)
		},
		setChannelName: function(frequency: number, name: string): void {
			//console.log('setChannelName', frequency, name)
			if (name && name[0] !== '#') {
				this.$set(this.channelNames, frequency, name)
			} else {
				this.$delete(this.channelNames, frequency)
			}
			channelNameSave(frequency, this.channelNames[frequency])
		},
		exportRadiosClick: function(elem: HTMLAnchorElement): void {
			elem.href = 'data:,' + encodeURIComponent(radiosSerialize(this.channels, this.channelNames))
		},
		importRadiosButton: function(): void {
			(this.$refs.radiosImportFile as HTMLInputElement).click()
		},
		importRadiosClick: function(elem: HTMLInputElement): void {
			if (!elem.files || !elem.files[0])
				return
			const fr = new FileReader()
			fr.onloadend = (e: ProgressEvent<FileReader>): boolean => {
				if (e && e.target && e.target.result) {
					const serialized: IRadiosSerialized = JSON.parse(e.target.result as string)
					this.channels = channelsImport(Object.keys(serialized))
					//this.channels.sort()
					channelsSave(this.channels)
					for (const frequency of this.channels) {
						const name = serialized[channelKeyMapExport(frequency)] || ''
						this.setChannelName(frequency, name)
					}
				}
				return false
			}
			fr.readAsText(elem.files[0])
		},
		recovered: function(event: Event) {
			console.log('recovered', this.recovery, event)
			this.recovery = true
			this.cancelRecoveryTimer()
		},
		recover: function(event: Event) {
			if (this.recovery) {
				console.log('recover', this.recovery, event)
				this.urlSfx = ''	// stop
				killAudio(this.$refs.audio as HTMLAudioElement)
				this.cancelRecoveryTimer()
				this.recoveryTimer = window.setTimeout(this.recoveryTimeout, 100)
			}
		},
		cancelRecoveryTimer: function() {
			if (this.recoveryTimer !== undefined) {
				console.log('cancelRecoveryTimer')
				window.clearTimeout(this.recoveryTimer)
				this.recoveryTimer = undefined
			}
		},
		recoveryTimeout: function(): void {
			console.log('recoveryTimeout', this.recovery)
			this.recoveryTimer = undefined
			if (this.recovery) {
				this.urlSfx = getUrlSfx()	// play
				//this.recoveryTimer = window.setTimeout(this.recoveryTimeout, 10000)
			}
		},
	},
})
