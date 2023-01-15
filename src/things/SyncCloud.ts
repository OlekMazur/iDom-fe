/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2022 Aleksander Mazur
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

import template from './SyncCloud.vue.js'
import Vue from 'vue'
import ButtonDelete from '../widgets/ButtonDelete'
import { IReverseRequestFile, IVariable, IPermissions } from '../data/Things'
import { formatTS } from '../format'
import { cloudClearFileSyncInfo } from '../data/cloud/Operations'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faCloud } from '@fortawesome/free-solid-svg-icons/faCloud'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons/faCloudUploadAlt'
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons/faCloudDownloadAlt'

export default Vue.extend({
	...template,
	components: { ButtonDelete },
	props: {
		place: String as () => string,
		info: Object as () => IVariable,
		permissions: Object as () => IPermissions,
		fn: String as () => string,
		file: Object as () => IReverseRequestFile,
	},
	computed: {
		icon: function(): IconDefinition {
			if (!this.info || this.file.error)
				return faExclamationTriangle
			if (this.file.cksum !== this.info.value)
				return faCloudUploadAlt
			if (this.info.want)
				return faCloudDownloadAlt
			return faCloud
		},
		title: function(): string {
			const msg = this.file.error || ''
			const ts = formatTS(this.file.ts / 1000)
			return msg && ts ? msg + '\n' + ts : msg + ts
		},
	},
	methods: {
		clearInfo: function(): void {
			cloudClearFileSyncInfo(this.place, this.fn)
		},
	},
})
