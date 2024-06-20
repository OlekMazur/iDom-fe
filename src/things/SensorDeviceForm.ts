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

import template from './SensorDeviceForm.vue.js'
import Vue from 'vue'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt'
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave'
import { OperationRenameThing, OperationRemoveThing, ErrorMessage } from '../data/API'
import { TThingType, IBaseNamedThingWithAlias, IPermissions } from '../data/Things'

const typeAccusative: { [type: string]: string } = {
	'devices': 'urządzenie',
	'sensors': 'czujnik',
	'neighbours': 'urządzenie z sąsiedztwa',
}

export default Vue.extend({
	...template,
	props: {
		place: String as () => string,
		alias: String as () => string,
		type: String as () => TThingType,
		id: String as () => string,
		thing: Object as () => IBaseNamedThingWithAlias,
		permissions: Object as () => IPermissions,
		showPlace: Boolean as () => boolean,
	},
	data: function() {
		return {
			formVisible: false,
			newAlias: this.thing.alias || '',
			iconCancel: faTimes,
			iconDelete: faTrashAlt,
			iconSave: faSave,
			working: false,
		}
	},
	methods: {
		showForm: function() {
			this.formVisible = true
			this.$nextTick(this.setFocus)
		},
		setFocus: function() {
			(this.$refs.focus as HTMLInputElement).focus()
		},
		renameThing: function() {
			if (this.id === undefined)
				return
			this.working = true
			OperationRenameThing(this.place, this.type, this.id, this.newAlias)
			.catch((e) => {
				this.$alert(ErrorMessage(e))
			}).then(() => {
				this.working = false
				this.formVisible = false
			})
		},
		deleteThing: function() {
			if (this.id === undefined)
				return
			if (confirm('Czy na pewno skasować ' + typeAccusative[this.type] + ' "' + this.thing.name + '"?')) {
				this.working = true
				OperationRemoveThing(this.place, this.type, this.id)
				.then(() => {
					this.formVisible = false
				}).catch((e) => {
					this.$alert(ErrorMessage(e))
				}).then(() => {
					this.working = false
				})
			}
		},
	},
})
