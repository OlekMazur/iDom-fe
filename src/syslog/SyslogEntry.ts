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

import template from './SyslogEntry.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle'
import { faExclamation } from '@fortawesome/free-solid-svg-icons/faExclamation'
import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo'
import { ISyslogEntry } from '../data/Syslog'
import { formatTS, formatElapsedTime } from '../format'

export default Vue.extend({
	...template,
	props: {
		entry: Object as () => ISyslogEntry,
		bootTS: Number as () => undefined | number,
		levels: Array as () => string[],
	},
	computed: {
		ts: function(): string {
			return this.bootTS === undefined ? formatElapsedTime(this.entry.ts) : formatTS(this.bootTS + this.entry.ts)
		},
		levelIcon: function(): IconDefinition | null {
			if (this.entry.severity <= 3) {
				return faExclamationTriangle
			} else if (this.entry.severity <= 4) {
				return faExclamationCircle
			} else if (this.entry.severity <= 5) {
				return faExclamation
			} else if (this.entry.severity <= 6) {
				return faInfo
			} else {
				return null
			}
		},
		levelStyle: function(): string {
			if (this.entry.severity <= 2) {
				return 'blink'
			} else {
				return ''
			}
		},
	},
})
