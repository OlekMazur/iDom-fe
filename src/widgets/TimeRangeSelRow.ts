/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2020 Aleksander Mazur
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

import template from './TimeRangeSelRow.vue.js'
import Vue from 'vue'
import { formatTS } from '../format'
import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons/faAngleDoubleLeft'
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'

/**
 * Returns default position at the time axis (end of time period), in seconds since Epoch.
 *
 * @return Timestamp of the nearest round hour, in seconds since Epoch.
 */
function getPosXEnd(roundTo = 3600, ts?: number): number {
	let result = ts === undefined ? Math.floor(Date.now() / 1000) : ts
	const rest = result % roundTo
	if (rest)
		result += roundTo - rest
	return result
}

export default Vue.extend({
	...template,
	props: {
		waiting: Boolean as () => boolean,
		rangeX: Number as () => number,
		posXEndInit: Number as () => number,
	},
	data: function() {
		const posXEndAuto = !this.posXEndInit
		const posXEnd = posXEndAuto ? getPosXEnd() : getPosXEnd(60, this.posXEndInit)
		return {
			faAngleDoubleLeft,
			faAngleDoubleRight,
			faSpinner,

			timerID: undefined as undefined | number,
			posXEndAuto,
			posXEnd,
			posXEndFormatted: formatTS(posXEnd),
			posXEndFormatValid: true,
			editing: false,
			focused: false,
			posXEndFormattedNew: undefined as undefined | string,
			width: 0,
		}
	},
	watch: {
		posXEnd: function(): void {
			//console.log('watch', 'posXEnd', this.posXEnd)
			if (this.posXEndAuto) {
				this.posXEndFormatted = formatTS(this.posXEnd)
				this.posXEndFormatValid = true
			}
			this.doRefresh()
		},
		posXEndFormatted: function(): void {
			//console.log('watch', 'posXEndFormatted', this.posXEndFormatted)
			if (!this.posXEndAuto) {
				const newPosXEnd = Math.floor(Date.parse(this.posXEndFormatted) / 1000)
				this.posXEndFormatValid = !isNaN(newPosXEnd)
				if (this.posXEndFormatValid)
					this.posXEnd = newPosXEnd
			}
		},
		posXEndAuto: function(newAuto: boolean, oldAuto: boolean): void {
			//console.log('watch', 'posXEndAuto', oldAuto, newAuto)
			if (oldAuto !== newAuto) {
				this.unscheduleAutoPosXEnd()
				if (newAuto) {
					this.rollback()
					this.autoPosXEnd()
					this.posXEndFormatted = formatTS(this.posXEnd)
					this.posXEndFormatValid = true
				}
			}
		},
	},
	methods: {
		unscheduleAutoPosXEnd: function(): void {
			if (this.timerID !== undefined) {
				//console.log('unscheduleAutoPosXEnd')
				window.clearTimeout(this.timerID)
				this.timerID = undefined
			}
		},
		scheduleAutoPosXEnd: function(): void {
			this.unscheduleAutoPosXEnd()
			//console.log('scheduleAutoPosXEnd')
			this.timerID = window.setTimeout(this.autoPosXEnd, 6000)
		},
		autoPosXEnd: function(): void {
			//console.log('autoPosXEnd')
			this.timerID = undefined
			this.posXEnd = getPosXEnd()
			this.scheduleAutoPosXEnd()
		},
		posXMove: function(forward: boolean): void {
			//console.log('posXMove', forward)
			this.posXEndAuto = false
			this.posXEnd = forward ? this.posXEnd + this.rangeX : this.posXEnd - this.rangeX
			this.posXEndFormatted = formatTS(this.posXEnd)
			this.posXEndFormatValid = true
		},
		doRefresh: function(): void {
			this.$emit('input', this.posXEnd)
		},
		begin: function() {
			this.width = (this.$refs.view as HTMLElement).offsetWidth + 64
			//console.log('begin', this.posXEndFormatted, this.width)
			this.posXEndFormattedNew = this.posXEndFormatted
			this.editing = true
			this.$nextTick(this.focus)
		},
		focus: function() {
			//console.log('focus', this.$refs.input);
			(this.$refs.input as HTMLInputElement).focus()
		},
		commit: function() {
			if (this.editing && this.posXEndFormattedNew !== undefined) {
				//console.log('commit', this.posXEndFormattedNew)
				this.posXEndFormatted = this.posXEndFormattedNew
				this.editing = false
				this.focused = false
			}
		},
		rollback: function() {
			//console.log('rollback', this.posXEndFormattedNew)
			this.editing = false
			this.focused = false
		},
	},
	mounted: function() {
		this.doRefresh()
		if (this.posXEndAuto)
			this.scheduleAutoPosXEnd()
	},
	destroyed: function() {
		this.unscheduleAutoPosXEnd()
	},
})
