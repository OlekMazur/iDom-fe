/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2022 Aleksander Mazur
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

import template from './VariableCell.vue.js'
import Vue, { Component } from 'vue'
import USB from './USB'
import BTS from './BTS'
import SMART from './SMART'
import Sync from './Sync'
import SyncCloud from './SyncCloud'
import Timestamp from './Timestamp'
import ButtonDelete from '../widgets/ButtonDelete'
import {
	IVariable, IPermissions,
	IReverseRequestFiles, IReverseRequestFile, VAR_SYNC_PREFIX,
} from '../data/Things'
import { OperationRemoveThing, ErrorMessage } from '../data/API'
import { formatTS, formatNumberWithUnit, formatElapsedTime } from '../format'

const BOLD: { [key: string]: boolean } = {
	'modem.sysmode': true,
	'modem.reg': true,
}

const xlatModemReg: { [value: string]: string } = {
	'unregistered': 'Nie',
	'searching': 'Szukanie sieci',
	'denied': 'Nie (odmowa)',
	'home': 'Tak (sieć macierzysta)',
	'roaming': 'Tak (roaming)',
	'unknown': 'Nie wiadomo',
}

const xlatModemPower: { [value: string]: string } = {
	'battery': 'Bateria',
	'charger': 'Ładowarka',
	'external': 'Zewnętrzne',
}

const DELETABLE_FAMILIES = ['modem', 'sim', 'smart']

function escapeFileName(fn: string): string {
	return encodeURIComponent(fn).replace(/\./g, '%2E')
}

const components: { [name: string]: Component } = { USB, BTS, SMART, Sync, ButtonDelete, Timestamp }
declare const VARIANT: string
if (VARIANT === 'cloud')
	components.SyncCloud = SyncCloud

export default Vue.extend({
	...template,
	components,
	props: {
		place: String as () => string,
		ts: Number as () => number,
		thing: Object as () => IVariable,
		permissions: Object as () => IPermissions,
		files: Object as () => IReverseRequestFiles,
	},
	data: function() {
		return {
			timeout: 60,
		}
	},
	computed: {
		family: function(): string {
			return this.thing && this.thing.key && this.thing.key.split('.', 2)[0]
		},
		value: function(): string {
			if (this.thing)
				switch (this.thing.key) {
					case 'sys.boot':
						return formatTS(parseInt(this.thing.value, 10))
						break
					case 'modem.reg':
						return xlatModemReg[this.thing.value]
					case 'modem.uptime':
						return formatElapsedTime(parseInt(this.thing.value, 10))
					case 'modem.flow.rx':
					case 'modem.flow.tx':
					case 'modem.qos.rx':
					case 'modem.qos.tx':
						return formatNumberWithUnit(parseInt(this.thing.value, 10), 'B', 1024)
					case 'modem.power':
						return xlatModemPower[this.thing.value]
					default:
						return this.thing.value
				}
			return ''
		},
		old: function(): boolean {
			if (!this.thing)
				return false
			const deltaTS = this.ts - this.thing.ts
			return deltaTS > this.timeout
		},
		style: function(): string {
			if (!this.thing)
				return ''
			return BOLD[this.thing.key] ? 'bold' : ''
		},
		deletable: function(): boolean {
			return (!this.permissions || this.permissions.variable || false) &&
				this.old && DELETABLE_FAMILIES.indexOf(this.family) >= 0
		},
		fn: function(): string {
			return this.thing && this.files && this.family === 'sync' &&
				escapeFileName(this.thing.key.substring(VAR_SYNC_PREFIX.length)) ||
				''
		},
		file: function(): IReverseRequestFile | undefined {
			return this.fn && this.files[this.fn] || undefined
		},
	},
	methods: {
		deleteThing: function() {
			if (confirm('Czy na pewno skasować wartość "' + this.thing.key + '"?')) {
				OperationRemoveThing(this.place, 'variables', this.thing.key)
				.catch((e) => this.$alert(ErrorMessage(e)))
			}
		},
	},
})
