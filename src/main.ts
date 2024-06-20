/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2022, 2023, 2024 Aleksander Mazur
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

import template from './main.vue.js'
import Vue from 'vue'
import VueRouter, { Route, RouteConfig } from 'vue-router'
import { faThermometerThreeQuarters } from '@fortawesome/free-solid-svg-icons/faThermometerThreeQuarters'
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faFilm } from '@fortawesome/free-solid-svg-icons/faFilm'
import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo'
import { faBuilding } from '@fortawesome/free-solid-svg-icons/faBuilding'
import { faWrench } from '@fortawesome/free-solid-svg-icons/faWrench'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons/faFileAlt'
import { faSlidersH } from '@fortawesome/free-solid-svg-icons/faSlidersH'
import { faTimeline } from '@fortawesome/free-solid-svg-icons/faTimeline'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret'
import { faHeadphones } from '@fortawesome/free-solid-svg-icons/faHeadphones'
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy'

import MenuEntry from './MenuEntry'
import Termostat from './things/Termostat'
import Chart from './chart/Chart'
import Messages from './messages/Messages'
import Cameras from './cameras/Cameras'
import Videos from './video/Videos'
import OtherThings from './things/OtherThings'
import System from './system/System'
import Syslog from './syslog/Syslog'
import CloudSystem from './cloudSystem/System'
import Termos from './termos/Termos'
import DeviceHistory from './deviceHistory/History'
import NeighboursNow from './neighbours/Now'
import NeighboursHistory from './neighbours/History'
import Audios from './audio/Audios'
import Syslogs from './syslogs/Syslogs'

import { DataStatus, IDataProvider } from './data/Provider'
import { createThingsProvider, createSystemInfoProvider, createAudiosProvider } from './data/API'
import { IPlacesThings, IThings, IThingsListener } from './data/Things'
import { ISystemInfo, ISystemInfoListener } from './data/System'
import { IAudios, IAudiosListener } from './data/Audio'
import { NotificationHub } from './notification'

declare const VARIANT: string

const TERMOSTAT_PATH = '/termostat'

interface IProviders {
	[name: string]: IDataProvider | undefined
}

class MainListener implements IThingsListener, ISystemInfoListener, IAudiosListener {
	constructor(
		public statusChanged: (status: DataStatus, message?: string) => void,
		public placeAdded: (place: string) => void,
		public placeRemoved: (place?: string) => void,
		public thingsChanged: (place: string, things: IThings) => void,
		public systemInfoChanged: (systemInfo: ISystemInfo) => void,
		public audiosChanged: (audios: IAudios) => void,
	) {
	}
}

const routes: RouteConfig[] = []
if (VARIANT === 'local' || VARIANT === 'cloud' || VARIANT === 'api1') {
	routes.push({
		path: '/',
		redirect: TERMOSTAT_PATH,
	})
	routes.push({
		path: TERMOSTAT_PATH,
		component: Termostat,
		meta: {
			title: 'Czujniki i urządzenia pod kontrolą termostatu',
			label: 'Termostat',
			icon: faThermometerThreeQuarters,
			provider: 'things',
		},
	})
}
if (VARIANT === 'cloud' || VARIANT === 'api1') {
	routes.push({
		path: '/chart',
		component: Chart,
		meta: {
			title: 'Wykres',
			icon: faChartLine,
			provider: 'things',
		},
	})
	routes.push({
		path: '/history',
		component: DeviceHistory,
		meta: {
			title: 'Historia pracy urządzenia',
			label: 'Historia',
			icon: faTimeline,
			provider: 'things',
		},
	})
}
if (VARIANT === 'local' || VARIANT === 'cloud') {
	routes.push({
		path: '/control',
		component: Termos,
		meta: {
			title: 'Nastawy',
			icon: faSlidersH,
			provider: 'things',
		},
	})
	routes.push({
		path: '/messages',
		component: Messages,
		meta: {
			title: 'Wiadomości',
			icon: faEnvelope,
			provider: 'things',
		},
	})
	routes.push({
		path: '/cameras',
		component: Cameras,
		meta: {
			title: 'Kamery',
			icon: faVideo,
			provider: 'things',
		},
	})
}
if (VARIANT === 'local' || VARIANT === 'cloud' || VARIANT === 'api1') {
	routes.push({
		path: '/video',
		component: Videos,
		meta: {
			title: 'Nagrania',
			icon: faFilm,
			provider: 'things',
		},
	})
	routes.push({
		path: '/things',
		component: OtherThings,
		meta: {
			title: 'Parametry, czujniki i urządzenia poza kontrolą termostatu',
			label: 'Pozostałe',
			icon: faBuilding,
			provider: 'things',
		},
	})
}
if (VARIANT === 'local') {
	routes.push({
		path: '/neighbours',
		component: NeighboursNow,
		meta: {
			title: 'Urządzenia z sąsiedztwa',
			label: 'Sąsiedztwo',
			icon: faUserSecret,
			provider: 'things',
		},
	})
	routes.push({
		path: '/audio',
		component: Audios,
		meta: {
			title: 'Mikrofony i radio',
			label: 'Dźwięk',
			icon: faHeadphones,
			provider: 'audio',
		},
	})
	routes.push({
		path: '/system',
		component: System,
		meta: {
			title: 'Informacje o systemie',
			label: 'System',
			icon: faWrench,
			provider: 'system',
		},
	})
	routes.push({
		path: '/syslog',
		component: Syslog,
		meta: {
			title: 'Dziennik systemowy',
			label: 'Dziennik',
			icon: faFileAlt,
			provider: undefined,
		},
	})
}
if (VARIANT === 'cloud' || VARIANT === 'api1') {
	routes.push({
		path: '/neighbours',
		component: NeighboursHistory,
		meta: {
			title: 'Historia urządzeń z sąsiedztwa',
			label: 'Sąsiedztwo',
			icon: faUserSecret,
			provider: 'things',
		},
	})
}
if (VARIANT === 'cloud') {
	routes.push({
		path: '/system',
		component: CloudSystem,
		meta: {
			title: 'Zaawansowane',
			icon: faWrench,
			provider: 'things',
		},
	})
}
if (VARIANT === 'local' || VARIANT === 'cloud') {
	routes.push({
		path: '/syslogs',
		component: Syslogs,
		meta: {
			title: 'Dzienniki systemowe z poprzednich uruchomień',
			label: 'Dzienniki',
			icon: faCopy,
			provider: 'things',
		},
	})
}

export default Vue.extend({
	...template,
	router: new VueRouter({
		routes,
	}),
	components: { MenuEntry },
	data: function() {
		const providers: IProviders = {}
		const placesThings: IPlacesThings = {}
		return {
			routes,
			providers,
			provider: undefined as undefined | string,
			placesThings,
			system: undefined as undefined | ISystemInfo,
			audios: undefined as undefined | IAudios,
			status: 'unknown' as DataStatus,
			message: '',
			nh: new NotificationHub(),
		}
	},
	created: function() {
		const listener = new MainListener(this.updateStatus,
			this.addPlace, this.removePlace, this.updateThings,
			this.updateSystem, this.updateAudios)
		this.providers.things = createThingsProvider(listener)
		this.providers.system = createSystemInfoProvider(listener)
		this.providers.audio = createAudiosProvider(listener)
		const meta = this.$router.currentRoute.meta
		this.$nextTick(() => this.switchProvider(meta ? meta.provider : undefined))
		this.$router.afterEach((to: Route) => {
			this.switchProvider(to.meta ? to.meta.provider : undefined)
		})
	},
	beforeDestroy: function() {
		this.switchProvider()
		// TODO: tear down all?
		this.providers = {}
	},
	methods: {
		switchProvider: function(to?: string) {
			if (to === this.provider) {
				return
			}
			if (this.provider !== undefined) {
				const impl = this.providers[this.provider]
				if (impl)
					impl.stop()
			}
			if (to !== undefined) {
				const impl = this.providers[to]
				if (impl)
					impl.start()
				this.status = 'working'
			} else {
				this.status = 'unknown'
			}
			this.provider = to
		},
		providerAction: function() {
			if (this.provider === undefined) {
				return
			}
			const impl = this.providers[this.provider]
			if (impl)
				impl.action()
		},
		updateStatus: function(status: DataStatus, message?: string) {
			//console.log('status', status, message)
			this.status = status
			this.message = message || ''
		},
		addPlace: function(place: string) {
			//console.log('addPlace', place)
			this.$set(this.placesThings, place, null)
		},
		removePlace: function(place?: string) {
			//console.log('removePlace', place)
			if (place === undefined)	// delete all places
				this.placesThings = {}
			else
				this.$delete(this.placesThings, place)
		},
		updateThings: function(place: string, things: IThings) {
			//console.log('updateThings', place)
			this.$set(this.placesThings, place, things)
			// notification hook
			this.nh.updateThings(place, things)
		},
		updateSystem: function(system: ISystemInfo) {
			this.system = system
		},
		updateAudios: function(audios: IAudios) {
			this.audios = audios
		},
	},
})
