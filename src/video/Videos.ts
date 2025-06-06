/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2022, 2023 Aleksander Mazur
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

import template from './Videos.vue.js'
import Vue, { Component } from 'vue'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'
import { faFastBackward } from '@fortawesome/free-solid-svg-icons/faFastBackward'
import { faStepBackward } from '@fortawesome/free-solid-svg-icons/faStepBackward'
import { faStepForward } from '@fortawesome/free-solid-svg-icons/faStepForward'
import { faFastForward } from '@fortawesome/free-solid-svg-icons/faFastForward'
import { IPlacesThings, IThings, IVariable, getPermittedPlaces, getVariableByKey } from '../data/Things'
import { strToInt } from '../utils'
import {
	storageLoadStr, storageSaveStr,
	storageLoadNumber, storageSaveNumber,
	storageLoadBool, storageSaveBool,
} from '../storage'
import VideosAtOnePlace from './VideosAtOnePlace'
import VideosAtAllPlaces from './VideosAtAllPlaces'
import EditNumber from '../widgets/EditNumber'
import ToggleSwitch from '../widgets/ToggleSwitch'

interface IAllPlacesExcluded {
	[place: string]: boolean
}

const getVariableIntVal = (variable?: IVariable, defaultValue = NaN): number => {
	if (variable)
		try {
			return strToInt(variable.value)
		} catch (_e) {
		}
	return defaultValue
}

const getVariableTS = (variable?: IVariable): number => {
	return variable && variable.ts || NaN
}

const components: { [name: string]: Component } = { VideosAtOnePlace, EditNumber, ToggleSwitch }
declare const VARIANT: string
if (VARIANT !== 'local')	// if (placeSelection) doesn't terse out VideosAtAllPlaces component from build
	components.VideosAtAllPlaces = VideosAtAllPlaces
const placeSelection = VARIANT !== 'local'

export default Vue.extend({
	...template,
	components,
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		const allPlacesExcluded: IAllPlacesExcluded = {}
		for (const place of storageLoadStr('videoShowPlacesExcluded').split(','))
			if (place)
				allPlacesExcluded[place] = true

		return {
			faSpinner,
			faPlay,
			faPause,
			faBell,
			iconNewest: faFastBackward,
			iconNewer: faStepBackward,
			iconOlder: faStepForward,
			iconOldest: faFastForward,
			placeSelection,
			showAtOnce: storageLoadNumber('videoShowAtOnce', 10),
			startFrom: NaN,
			// meaning of place === '' depends on placeSelection:
			// placeSelection ? empty place means many : empty place is valid ID of a particular place
			place: undefined as undefined | string,	// undefined only at initial stage; never reset to undefined by user
			allPlay: storageLoadBool('videoAllPlay'),
			allPlacesExcluded,
		}
	},
	computed: {
		places: function(): string[] {
			//console.log('computed', 'places', Object.keys(this.placesThings))
			//return Object.keys(this.placesThings).sort()
			return getPermittedPlaces(this.placesThings, 'video').sort()
		},
		selectedPlaces: function(): string[] {
			const result: string[] = []
			for (const place of this.places)
				if (!this.allPlacesExcluded[place])
					result.push(place)
			//console.log('computed', 'selectedPlaces', this.places, result)
			return result
		},
		things: function(): IThings | undefined {
			//console.log('computed', 'things', this.place)
			return this.place !== undefined && this.placesThings[this.place] || undefined
		},
		varRecMin: function(): IVariable | undefined {
			return getVariableByKey('rec.min', this.things)
		},
		varRecMax: function(): IVariable | undefined {
			return getVariableByKey('rec.max', this.things)
		},
		updateTS: function(): number {
			const tsMin = getVariableTS(this.varRecMin)
			const tsMax = getVariableTS(this.varRecMax)
			//console.log('computed', 'updateTS', tsMin, tsMax)
			return tsMin > tsMax ? tsMin : tsMax
		},
		recMin: function(): number {
			return getVariableIntVal(this.varRecMin, 1)
		},
		recMax: function(): number {
			return getVariableIntVal(this.varRecMax, 0)
		},
		minStartFrom: function(): number {
			let result = this.recMin + this.showAtOnce - 1
			if (result > this.recMax)
				result = this.recMax
			return result
		},
	},
	watch: {
		places: {
			immediate: true,
			handler: function(): void {
				//console.log('watch', 'places', this.places, this.place)
				this.autoSelectPlace()
			},
		},
		place: {
			immediate: true,
			handler: function(): void {
				//console.log('watch', 'place', this.place, this.recMax)
				this.startFrom = NaN
			},
		},
		recMin: {
			immediate: true,
			handler: function(now: number, old: number): void {
				//console.log('watch', 'recMin', old, now)
				if (isNaN(now))
					return
				if (!isNaN(this.startFrom) && this.startFrom <= old + this.showAtOnce - 1)
					this.setStartFrom(now)
			},
		},
		recMax: {
			immediate: true,
			handler: function(now: number, old: number): void {
				//console.log('watch', 'recMax', old, now)
				if (isNaN(now))
					return
				if (isNaN(this.startFrom) || this.startFrom >= old)
					this.setStartFrom(now)
			},
		},
		showAtOnce: function(): void {
			storageSaveNumber('videoShowAtOnce', this.showAtOnce)
		},
		allPlay: function(): void {
			storageSaveBool('videoAllPlay', this.allPlay)
		},
	},
	methods: {
		placeSelected: function(): void {
			//console.log('placeSelected', this.place)
			if (placeSelection)
				storageSaveStr('videoPlace', this.place || '')
		},
		savePlacesExcluded: function(): void {
			const result: string[] = []
			for (const place in this.allPlacesExcluded)
				if (this.allPlacesExcluded[place])
					result.push(place)
			//console.log('savePlacesExcluded', result)
			storageSaveStr('videoShowPlacesExcluded', result.join(','))
		},
		excludePlace: function(place: string, exclude: boolean): void {
			//console.log('excludePlace', place, exclude)
			this.$set(this.allPlacesExcluded, place, exclude)
			this.savePlacesExcluded()
		},
		autoSelectPlace: function(): void {
			if (this.place !== undefined)
				if (this.places.indexOf(this.place) < 0)
					this.place = undefined
				else
					return
			// this.place === undefined
			const place = placeSelection ? storageLoadStr('videoPlace') : this.places[0]
			this.place = this.places.indexOf(place) >= 0 ? place : ''
		},
		setStartFrom: function(now: number): void {
			//console.log('setStartFrom', now)
			if (now < this.minStartFrom)
				now = this.minStartFrom
			if (now > this.recMax)
				now = this.recMax
			this.startFrom = now
		},
	},
})
