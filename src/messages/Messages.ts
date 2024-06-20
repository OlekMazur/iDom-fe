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

import template from './Messages.vue.js'
import Vue from 'vue'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { IPlacesThings, IThings, IMessages, IMessage, getVariableByKey } from '../data/Things'
import { sendUSSD, sendSMS, purgeMessages, ErrorMessage } from '../data/API'
import { storageLoadStr, storageSaveStr } from '../storage'
import Message from './Message'
import USSDHints from './USSDHints'

function cmpMessages(a: IMessage, b: IMessage): number {
	return b.ts - a.ts
}

declare const VARIANT: string
const placeSelection = VARIANT !== 'local'

type TMessageGroup = ''|'SMS'|'USSD'

export default Vue.extend({
	...template,
	components: { Message, USSDHints },
	props: {
		placesThings: Object as () => IPlacesThings,
	},
	data: function() {
		return {
			iconSend: faPaperPlane,
			iconDelete: faTimes,
			op: '' as TMessageGroup,
			ussd: '',
			smsTo: '',
			sms: '',
			working: false,
			placeSelection,
			place: undefined as undefined | string,
		}
	},
	computed: {
		places: function(): string[] {
			//console.log('computed', 'places', Object.keys(this.placesThings))
			//return Object.keys(this.placesThings).sort()
			const result: string[] = []
			for (const place in this.placesThings) {
				const things = this.placesThings[place]
				if (things) {
					const p = things.permissions
					if (!p || (p.post && (p.post.sms || p.post.ussd)))
						result.push(place)
				}
			}
			return result.sort()
		},
		things: function(): IThings | undefined {
			//console.log('computed', 'things', this.place)
			return this.place !== undefined && this.placesThings[this.place] || undefined
		},
		messages: function(): IMessages {
			//console.log('computed', 'messages', this.place)
			const result: IMessages = []
			if (this.things && this.things.messages) {
				const len = this.things.messages.length
				for (let i = 0; i < len; i++)
					result.push(this.things.messages[i])
				result.sort(cmpMessages)
			}
			return result
		},
		imsi: function(): string | undefined {
			//console.log('computed', 'imsi', this.place)
			//if (this.things && this.things.variables && this.things.variables['sim.imsi'])
			//	return this.things.variables['sim.imsi'].value
			return getVariableByKey('sim.imsi', this.things)?.value
		},
		permUSSD: function(): boolean {
			if (!this.things)
				return false
			if (!this.things.permissions)
				return true
			return this.things.permissions.post?.ussd || false
		},
		permSMS: function(): boolean {
			if (!this.things)
				return false
			if (!this.things.permissions)
				return true
			return this.things.permissions.post?.sms || false
		},
		permMsgPurge: function(): boolean {
			if (!this.things)
				return false
			if (!this.things.permissions)
				return true
			const post = this.things.permissions.post
			return post && post['msg-purge'] || false
		},
		/*
		pendingUSSD: function(): IGenericParams | undefined {
			//console.log('computed', 'pendingUSSD', this.things && this.things.request && this.things.request.generic &&
			//	JSON.stringify(this.things.request.generic.ussd))
			return this.things && this.things.request && this.things.request.generic &&
				typeof this.things.request.generic.ussd === 'object' && this.things.request.generic.ussd || undefined
		},
		pendingSMS: function(): IGenericParams | undefined {
			//console.log('computed', 'pendingSMS', this.things && this.things.request && this.things.request.generic &&
			//	JSON.stringify(this.things.request.generic.sms))
			return this.things && this.things.request && this.things.request.generic &&
				typeof this.things.request.generic.sms === 'object' && this.things.request.generic.sms || undefined
		},
		*/
	},
	watch: {
		places: {
			immediate: true,
			handler: function() {
				//console.log('watch', 'places', this.places, this.place)
				if (this.place !== undefined)
					if (this.places.indexOf(this.place) < 0)
						this.place = undefined
					else
						return
				// this.place === undefined
				const place = placeSelection ? storageLoadStr('messagePlace') : this.places[0]
				if (place !== undefined && this.places.indexOf(place) >= 0)
					this.place = place
			},
		},
		permUSSD: function() {
			if (this.op === 'USSD' && !this.permUSSD)
				this.op = ''
		},
		permSMS: function() {
			if (this.op === 'SMS' && !this.permSMS)
				this.op = ''
		},
		/*
		pendingUSSD: {
			immediate: true,
			handler: function() {
				this.updatePendingUSSD()
			},
		},
		pendingSMS: {
			immediate: true,
			handler: function() {
				this.updatePendingSMS()
			},
		},
		*/
	},
	methods: {
		selectPlace: function(place?: string): void {
			//console.log('selectPlace', place)
			this.place = place
			if (placeSelection && place !== undefined)
				storageSaveStr('messagePlace', place)
		},
		submit: function(confirmation: string) {
			if (this.place === undefined)
				return
			if (confirm(confirmation)) {
				this.working = true
				let promise: Promise<void>
				switch (this.op) {
					case 'USSD':
						promise = sendUSSD(this.place, this.ussd)//.then(this.updatePendingUSSD)
						break
					case 'SMS':
						promise = sendSMS(this.place, this.smsTo, this.sms)//.then(this.updatePendingSMS)
						break
					default:
						promise = Promise.reject()
						break
				}
				promise.catch((e) => {
					this.$alert(ErrorMessage(e))
				}).then(() => {
					this.working = false
				})
			}
		},
		/*
		cancel: function() {
			if (this.place === undefined)
				return
			if (this.op !== 'USSD' && this.op !== 'SMS')
				return
			this.working = true
			cancelOrderUSSDorSMS(this.place, this.op)
			.catch((e) => {
				this.$alert(ErrorMessage(e))
			}).then(() => {
				this.working = false
			})
		},
		updatePendingUSSD: function() {
			this.ussd = this.pendingUSSD && this.pendingUSSD.ussd || ''
			//console.log('watch', 'pendingUSSD', this.ussd)
		},
		updatePendingSMS: function() {
			if (this.pendingSMS) {
				this.smsTo = this.pendingSMS.to
				this.sms = this.pendingSMS.content
			} else {
				this.smsTo = ''
				this.sms = ''
			}
			//console.log('watch', 'pendingSMS', this.smsTo, this.sms)
		},
		*/
		purge: function() {
			if (this.place === undefined)
				return
			if (confirm(`Czy na pewno skasować wszystkie odebrane wiadomości ${this.op}, które zostały już obsłużone?`)) {
				this.working = true
				purgeMessages(this.place, this.op).catch((e) => {
					this.$alert(ErrorMessage(e))
				}).then(() => {
					this.working = false
				})
			}
		},
	},
})
