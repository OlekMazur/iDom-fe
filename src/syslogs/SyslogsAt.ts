/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021, 2023, 2024 Aleksander Mazur
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

import template from './SyslogsAt.vue.js'
import Vue from 'vue'
import { IThings } from '../data/Things'
import { ILogFile, LogsRegisterListener, LogsUnregisterListener, LogsForceSync } from '../data/API'
import { formatTS } from '../format'
import Syslog from './Syslog'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'

export default Vue.extend({
	...template,
	components: { Syslog },
	props: {
		things: Object as () => IThings,
		place: String as () => string,
		showAtOnce: Number as () => number,
	},
	data: function() {
		const syslogs: ILogFile[] = []
		let ts: number | undefined

		return {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			query: undefined as any,
			syslogs,
			ts,
			waiting: false,

			faSpinner,
			faEnvelope,
			faSync,
		}
	},
	computed: {
		permissionToOrder: function(): boolean | undefined {
			return this.things && this.things.permissions && this.things.permissions.order
		},
		refreshAvailable: function(): boolean | undefined  {
			return this.things && this.things.permissions && this.things.permissions.logsSync
		},
		tsFormatted: function(): string {
			return this.ts ? formatTS(this.ts) : ''
		},
	},
	methods: {
		logsCB: function(place: string, syslogs: ILogFile[], ts?: number): void {
			//console.log('logsCB', place, syslogs.length)
			if (place !== this.place)
				return
			this.syslogs = syslogs
			this.ts = ts
			this.waiting = false
		},
		refresh: function(): void {
			LogsForceSync(this.place)
		},
		register: function() {
			this.query = LogsRegisterListener(this.place, this.logsCB, this.showAtOnce)
			this.waiting = true
		},
		unregister: function() {
			if (this.query) {
				LogsUnregisterListener(this.query)
				this.query = undefined
			}
		},
	},
	watch: {
		showAtOnce: function(): void {
			this.unregister()
			this.register()
		},
	},
	mounted: function() {
		this.register()
	},
	destroyed: function() {
		this.unregister()
	},
})
