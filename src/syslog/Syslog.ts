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

import template from './Syslog.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo'
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { QuerySyslog, ISyslogRaw } from '../data/local/Syslog'
import { orderByNameAsc } from '../sort'
import ProcessSyslog from '../data/local/ProcessSyslog'
import { ISyslogEntry } from '../data/Syslog'
import SyslogEntry from './SyslogEntry'

export default Vue.extend({
	...template,
	components: { SyslogEntry },
	data: function() {
		return {
			levels: ['alarmy', 'alerty', 'krytyczne', 'błędy', 'ostrzeżenia', 'notki', 'informacje', 'nieważne'],
			levelIcon: faInfo,
			level: 3,
			identities: [''],
			identity: '',
			updatePromise: undefined as undefined | Promise<void>,
			bootTS: undefined as undefined | number,
			syslog: [] as ISyslogEntry[],
		}
	},
	computed: {
		refreshIcon: function(): IconDefinition {
			return this.updatePromise ? faSpinner : faSync
		},
		working: function(): boolean {
			return !!this.updatePromise
		},
		disabledIfWorking: function(): string {
			return this.updatePromise ? 'disabled' : ''
		},
	},
	created: function() {
		this.update()
	},
	watch: {
		level: function() {
			this.update()
		},
	},
	methods: {
		update: function(): void {
			console.log('SYSLOG', this.updatePromise)
			if (this.updatePromise !== undefined)
				return
			this.updatePromise = QuerySyslog(this.level)
			.then(this.updateSuccess)
			.catch(this.updateFailed)
		},
		updateSuccess: function(syslog: ISyslogRaw): void {
			this.bootTS = syslog.bootTS
			try {
				this.syslog = ProcessSyslog(syslog.raw, this.identities)
				this.identities.sort(orderByNameAsc)
				this.updatePromise = undefined
			} catch (e) {
				this.updateFailed(e)
			}
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		updateFailed: function(e: any): void {
			console.log('SYSLOG: failed', e)
			this.syslog = []
			this.updatePromise = undefined
		},
	},
})
