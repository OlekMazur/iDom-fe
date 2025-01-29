/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021 Aleksander Mazur
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

import template from './Termos.vue.js'
import Vue from 'vue'
import {
	IPlacesThings, IThings, IVariable, ITermosMapping,
	getTermosMapping, getPermittedPlaces,
	getVariableIDByKey, SYNC_TERMOSTAT_BIN,
} from '../data/Things'
import { ITermos, TTermosWeek, termosNew, termosDecompile, termosCompile } from '../data/Termos'
import { queryTermos, postTermos, ErrorMessage } from '../data/API'
import { storageLoadStr, storageSaveStr } from '../storage'
import { TERMOS_TEMP_STEP } from '../config'
import Functions from './Functions'
import Formulas from './Formulas'
import DailyThermal from './DailyThermal'
import DailyTimer from './DailyTimer'
import ButtonDelete from '../widgets/ButtonDelete'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faMagic } from '@fortawesome/free-solid-svg-icons/faMagic'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faFileExport } from '@fortawesome/free-solid-svg-icons/faFileExport'
import { faFileImport } from '@fortawesome/free-solid-svg-icons/faFileImport'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'

/* ---------------------------------- */

function prepareTermos(termos: ITermos): void {
	const fracDigits = -Math.log10(TERMOS_TEMP_STEP)
	for (const key in termos.thermalPrograms)
		for (const entry of termos.thermalPrograms[key]) {
			entry.temp = Number(entry.temp.toFixed(fracDigits))
			entry.hyst = Number(entry.hyst.toFixed(fracDigits))
		}
}

/* ---------------------------------- */

declare const VARIANT: string
const placeSelection = VARIANT !== 'local'

export default Vue.extend({
	...template,
	components: { Functions, Formulas, DailyThermal, DailyTimer, ButtonDelete },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		return {
			place: undefined as undefined | string,
			termos: termosNew(),
			placeSelection,
			doLoad: {},
			loading: undefined as undefined | object,
			saving: false,
			promise: undefined as undefined | Promise<void>,
			timer: undefined as undefined | number,
			error: '',
			downloadURL: undefined as undefined | string,
			TEMP_STEP: TERMOS_TEMP_STEP,

			faSpinner,
			faMagic,
			faTimes,
			faPlus,
			faFileExport,
			faFileImport,
			faExclamationTriangle,
		}
	},
	destroyed: function() {
		this.cancelTimer()
		this.loading = undefined	// to cancel retrying from running promise
	},
	computed: {
		places: function(): string[] {
			//return Object.keys(this.placesThings).sort()
			return getPermittedPlaces(this.placesThings, 'things').sort()
		},
		things: function(): IThings | undefined {
			return this.place !== undefined && this.placesThings[this.place] || undefined
		},
		mapping: function(): ITermosMapping | undefined {
			return this.things ? getTermosMapping(this.things) : undefined
		},
		thermalPrograms: function(): string[] {
			return Object.keys(this.termos.thermalPrograms).sort()
		},
		timerPrograms: function(): string[] {
			return Object.keys(this.termos.timerPrograms).sort()
		},
		cksumVarID: function(): string | undefined {
			return getVariableIDByKey(SYNC_TERMOSTAT_BIN, this.things)
		},
		cksumVar: function(): IVariable | undefined {
			return this.cksumVarID && this.things?.variables && this.things.variables[this.cksumVarID] || undefined
		},
		cksum: function(): string {
			return this.cksumVar?.value || ''
		},
		unsynchronized: function(): boolean {
			return this.cksumVar && typeof this.cksumVar.want === 'string' && this.cksumVar.want !== this.cksum || false
		},
		forbidden: function(): boolean {
			if (!this.things)
				return true
			if (this.things?.permissions && !this.things.permissions.variable)
				return true
			return false
		},
		downloadFileName: function(): string {
			return 'termostat' + (this.place ? '-' + this.place : '') + '.bin'
		},
		disabled: function(): boolean {
			return !!this.loading || this.saving
		},
	},
	methods: {
		cancelTimer: function(): void {
			if (this.timer !== undefined) {
				window.clearTimeout(this.timer)
				this.timer = undefined
			}
		},
		selectPlace: function(place?: string): void {
			//console.log('selectPlace', place)
			this.place = place
			if (placeSelection && place !== undefined)
				storageSaveStr('termosPlace', place)
		},
		load: function(): void {
			this.error = ''
			this.loadTry()
		},
		loadTry: function(): void {
			if (this.place === undefined)
				return
			this.cancelTimer()
			const loading = {}
			//console.log('loadTry', this.loading, loading)
			this.loading = loading
			this.promise = queryTermos(this.place, this.cksum)
			.then((data) => {
				if (loading !== this.loading)
					return
				try {
					this.termos = termosDecompile(data)
				} catch (e) {
					console.error(e)
					this.termos = termosNew()
				}
				prepareTermos(this.termos)
				this.promise = undefined
				this.loading = undefined
				this.error = ''
			}).catch((e) => {
				if (loading !== this.loading)
					return
				this.error = ErrorMessage(e)
				this.promise = undefined
				this.cancelTimer()
				if (this.loading)	// cleared inside "destroyed"
					this.timer = window.setTimeout(this.loadRetry, 2000)
			})
		},
		loadRetry: function(): void {
			this.timer = undefined
			this.loadTry()
		},
		clear: function(): void {
			this.cancelTimer()
			this.loading = undefined
			this.termos = termosNew()
		},
		submit: function(): void {
			if (this.place === undefined)
				return
			this.cancelTimer()
			const data = this.compile()
			if (!data)
				return
			if (confirm('Czy na pewno zastosować zmiany w nastawach?\r\n'
				+ 'Jesteś pewien, że banglanie tymi przekaźnikami jest bezpieczne?')) {
				this.saving = true
				postTermos(this.place, this.cksumVarID, data)
				/*
				.then(() => new Promise((resolve) => window.setTimeout(resolve, 5000)))
				.then(() => {
					this.saving = false
					this.load()
				})*/.catch((e) => {
					this.$alert(ErrorMessage(e))
				}).then(() => {
					this.saving = false
				})
			}
		},
		download: function(elem: HTMLAnchorElement): void {
			if (this.downloadURL !== undefined) {
				URL.revokeObjectURL(this.downloadURL)
				this.downloadURL = undefined
			}
			if (this.place === undefined)
				return
			const data = this.compile()
			if (!data)
				return
			this.downloadURL = URL.createObjectURL(new Blob([data], {
				type: 'application/octet-binary',
			}))
			elem.href = this.downloadURL
		},
		importTermosButton: function(): void {
			(this.$refs.termosImportFile as HTMLInputElement).click()
		},
		importTermosClick: function(elem: HTMLInputElement): void {
			if (!elem.files || !elem.files[0])
				return
			const fr = new FileReader()
			fr.onloadend = (e: ProgressEvent<FileReader>): boolean => {
				if (e && e.target && e.target.result) {
					try {
						this.termos = termosDecompile(e.target.result as ArrayBuffer)
						prepareTermos(this.termos)
					} catch (e) {
						console.error(e)
					}
				}
				return false
			}
			fr.readAsArrayBuffer(elem.files[0])
		},
		compile: function() {
			try {
				return termosCompile(this.termos)
			} catch (e) {
				this.$alert(ErrorMessage(e))
			}
		},
		nextProgram: function(): string {
			for (let i = 1; i < 100; i++) {
				const id = '' + i
				if (!(this.termos.timerPrograms[id] || this.termos.thermalPrograms[id]))
					return id
			}
			return ''
		},
		deleteTimerProgram: function(program: string): void {
			this.deleteProgramRefs(program, this.termos.timer)
			this.$delete(this.termos.timerPrograms, program)
		},
		deleteThermalProgram: function(program: string): void {
			for (const func of this.termos.functions)
				this.deleteProgramRefs(program, func.programs)
			this.$delete(this.termos.thermalPrograms, program)
		},
		deleteProgramRefs: function(program: string, week: TTermosWeek): void {
			for (let i = 0; i < 7; i++)
				if (week[i] === program)
					week[i] = ''
		},
	},
	watch: {
		places: {
			immediate: true,
			handler: function() {
				if (this.place !== undefined)
					if (this.places.indexOf(this.place) < 0)
						this.place = undefined
					else
						return
				// this.place === undefined
				const place = placeSelection ? storageLoadStr('termosPlace') : this.places[0]
				if (place !== undefined && this.places.indexOf(place) >= 0) {
					//console.log('watch', 'places', this.places, place)
					this.place = place
				}
			},
		},
		place: {
			immediate: true,
			handler: function() {
				this.doLoad = {}
			},
		},
		cksum: {
			immediate: true,
			handler: function() {
				this.doLoad = {}
			},
		},
		doLoad: {
			immediate: true,
			handler: function() {
				this.load()
			},
		},
	},
})
