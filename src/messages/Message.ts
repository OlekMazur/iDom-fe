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

import template from './Message.vue.js'
import Vue from 'vue'
import { localDeleteMessage } from '../data/local/Operations'
import { ErrorMessage } from '../data/API'
import { IMessage } from '../data/Things'
import { formatTS } from '../format'
import ButtonDelete from '../widgets/ButtonDelete'
import { faSimCard } from '@fortawesome/free-solid-svg-icons/faSimCard'
import { faSms } from '@fortawesome/free-solid-svg-icons/faSms'
import { faCommentDollar } from '@fortawesome/free-solid-svg-icons/faCommentDollar'
import './Message.css'

export default Vue.extend({
	...template,
	components: { ButtonDelete },
	props: {
		message: Object as () => IMessage,
		imsi: String as () => string,
	},
	data: function() {
		return {
			faSimCard,
			faSms,
			faCommentDollar,
		}
	},
	computed: {
		matchesIMSI: function(): boolean {
			return this.message && this.message.name && this.message.name.split(',', 1)[0] === this.imsi || false
		},
		ts: function(): string {
			return this.message ? formatTS(this.message.ts) : ''
		},
		rowStyle: function(): string {
			return this.matchesIMSI ? '' : 'message-disabled'
		},
		deletable: function(): boolean {
			return this.message && (!this.message.copy || this.message.sent)
		},
	},
	methods: {
		deleteMessage: function(): void {
			if (confirm('Czy na pewno skasować wiadomość?')) {
				const {
					ts,
					group,
					name,
					from,
				} = this.message
				localDeleteMessage('', ts, group, name || '', from)
				.catch((e) => {
					this.$alert(ErrorMessage(e))
				})
			}
		},
	},
})
