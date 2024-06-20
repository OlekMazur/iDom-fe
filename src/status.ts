/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2024 Aleksander Mazur
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

import template from './status.vue.js'
import Vue from 'vue'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faUnlink } from '@fortawesome/free-solid-svg-icons/faUnlink'
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt'
import { DataStatus } from './data/Provider'

interface IStatusInfo {
	icon: IconDefinition
	blink?: boolean
	pulse?: boolean
}

interface IStatusInfos {
	[status: string]: IStatusInfo
}

const statusInfo: IStatusInfos = {
	'ok': { icon: faLink },
	'working': { icon: faSpinner, pulse: true },
	'timeout': { icon: faUnlink, blink: true },
	'error': { icon: faExclamationTriangle, blink: true },
	'auth': { icon: faSignInAlt, blink: true },
}

export default Vue.extend({
	...template,
	props: {
		status: String as () => DataStatus,
		title: String,
	},
	computed: {
		info: function(): IStatusInfo | undefined {
			return statusInfo[this.status]
		},
		icon: function(): IconDefinition | undefined {
			return this.info?.icon
		},
		pulse: function(): boolean | undefined {
			return this.info?.pulse
		},
		style: function(): string {
			return this.info?.blink && 'blink' || ''
		},
	},
})
