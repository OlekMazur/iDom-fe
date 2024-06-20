/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2023 Aleksander Mazur
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

import template from './NetIf.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload'
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome'
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons/faNetworkWired'
import { faWifi } from '@fortawesome/free-solid-svg-icons/faWifi'
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe'
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone'
import { ISystemInfoNetIf } from '../data/System'
import Throughput from './Throughput'
import ThroughputIcon from './ThroughputIcon'

export interface INetIfWithName extends ISystemInfoNetIf {
	name: string
}

const NETIF_ICON: { [name: string]: IconDefinition } = {
	'brint': faHome,
	'eth': faNetworkWired,
	'wlan': faWifi,
	'wwan': faGlobe,
	'ppp': faPhone,
}

export default Vue.extend({
	...template,
	components: { Throughput, ThroughputIcon },
	props: {
		data: Object as () => INetIfWithName,
		uptime: Number as () => number,
	},
	data: function() {
		return {
			iconDown: faDownload,
			iconUp: faUpload,
		}
	},
	computed: {
		icon: function(): IconDefinition {
			return NETIF_ICON[this.data.name.replace(/\d+$/, '')]
		},
	},
})
