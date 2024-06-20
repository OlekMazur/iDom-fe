/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021 Aleksander Mazur
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

import template from './ThingsTable.vue.js'
import Vue from 'vue'
import ThingCell from './ThingCell'
import ToggleSwitch from '../widgets/ToggleSwitch'
import { IPlaceSelect, IThingsInfo, IThingsState } from './things'
import { IPlacesThings, IThingsGroup, TThingType, buildGlobalThingID } from '../data/Things'
import { OperationSetThingColor, ErrorMessage, wakeup } from '../data/API'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { faChartArea } from '@fortawesome/free-solid-svg-icons/faChartArea'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'

export default Vue.extend({
	...template,
	components: { ThingCell, ToggleSwitch },
	props: {
		placesThings: Object as () => IPlacesThings,
		places: Array as () => string[],
		placeSelect: Object as () => IPlaceSelect,
		devices: Array as () => IThingsGroup[],
		deviceInfo: Object as () => IThingsInfo,
		deviceState: Object as () => IThingsState,
		sensors: Array as () => IThingsGroup[],
		sensorState: Object as () => IThingsState,
		sensorInfo: Object as () => IThingsInfo,
	},
	data: function() {
		return {
			wakeup,

			faQuestion,
			faChartArea,
			faBell,
		}
	},
	methods: {
		getThingID: function(place: string, group: IThingsGroup): string | undefined {
			return buildGlobalThingID({
				place,
				id: group.idAt[place],
			})
		},
		changeColor: function(place: string, type: TThingType, group: IThingsGroup, value: string): void {
			OperationSetThingColor(place, type, group.idAt[place], value)
			.catch((e) => {
				this.$alert(ErrorMessage(e))
			})
		},
	},
})
