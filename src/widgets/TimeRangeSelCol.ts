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

import template from './TimeRangeSelCol.vue.js'
import Vue from 'vue'
import { strToInt } from '../utils'
import { pluralForm } from '../format'
import { storageLoadStr, storageSaveStr } from '../storage'

/** One <option> for a <select>. */
export interface ISelectOption {
	value: string
	label: string
}

/**
 * Returns recommended options of the width of X axis range
 * (time period).
 */
function getRangeXOptions(): ISelectOption[] {
	const result: ISelectOption[] = []
	for (const mul of [1, 2, 3, 4, 6, 8, 12, 16])
		result.push({
			value: '' + (mul * 60 * 60),
			label: mul + ' ' + pluralForm(mul, 'godzina', 'godziny', 'godzin'),
		})
	for (const mul of [1, 2, 3, 4, 5, 6])
		result.push({
			value: '' + (mul * 24 * 60 * 60),
			label: mul + ' ' + pluralForm(mul, 'doba', 'doby', 'dób'),
		})
	for (const mul of [1])
		result.push({
			value: '' + (mul * 7 * 24 * 60 * 60),
			label: mul + ' ' + pluralForm(mul, 'tydzień', 'tygodnie', 'tygodni'),
		})
	return result
}

export default Vue.extend({
	...template,
	props: {
		storagePrefix: String as () => string,
	},
	data: function() {
		return {
			rangeXOptions: getRangeXOptions(),
			rangeXOpt: storageLoadStr(this.storagePrefix + 'RangeX', '' + (24 * 60 * 60)),
		}
	},
	computed: {
		rangeX: function(): number {
			return strToInt(this.rangeXOpt)
		},
	},
	watch: {
		rangeXOpt: function(value): void {
			storageSaveStr(this.storagePrefix + 'RangeX', value)
		},
		rangeX: 'doRefresh',
	},
	methods: {
		doRefresh: function(): void {
			this.$emit('input', this.rangeX)
		},
	},
	mounted: function() {
		this.doRefresh()
	},
})
