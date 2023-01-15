/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2021 Aleksander Mazur
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
import { IThings, getWakeUpSession } from '../data/Things'
import { wakeup, ILogFile, LogsRegisterListener, LogsUnregisterListener, LogsForceSync } from '../data/API'
import { formatTS } from '../format'
import Syslog from './Syslog'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope'
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'

export default Vue.extend({
	...template,
	components: { Syslog },
	props: {
		things: Object as () => IThings,
		place: String as () => string,
	},
	data: function() {
		const syslogs: ILogFile[] = []

		return {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			query: undefined as any,
			syslogs,
			waiting: false,

			faSpinner,
			faEnvelope,
			faSync,
			faBell,
		}
	},
	computed: {
		permissionToOrder: function() {
			return this.things && this.things.permissions && this.things.permissions.orderLog
		},
		ts: function() {
			return this.things && this.things.request && this.things.request.logListSyncTS && formatTS(this.things.request.logListSyncTS) || ''
		},
		refreshAvailable: function() {
			return this.things && this.things.permissions && this.things.permissions.logListSync
				&& this.things.request && this.things.request.logListSync
		},
	},
	methods: {
		logsCB: function(place: string, syslogs: ILogFile[]): void {
			//console.log('logsCB', place, syslogs.length)
			if (place !== this.place)
				return

			this.syslogs = syslogs
			this.waiting = false
		},
		getWakeUp: function(): string | undefined {
			return getWakeUpSession(this.things)
		},
		wakeup: function(): void {
			const session = this.getWakeUp()
			if (session)
				wakeup(session)
		},
		refresh: function(): void {
			LogsForceSync(this.place)
		},
	},
	mounted: function() {
		this.query = LogsRegisterListener(this.place, this.logsCB)
		this.waiting = true
	},
	destroyed: function() {
		if (this.query) {
			LogsUnregisterListener(this.query)
			this.query = undefined
		}
	},
})
