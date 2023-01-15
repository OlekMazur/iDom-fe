<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2022 Aleksander Mazur

iDom-fe is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

iDom-fe is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public License
along with iDom-fe. If not, see <https://www.gnu.org/licenses/>.
-->

<div>
	<div class="menu">
		<table class="center">
			<tbody>
				<tr class="form-row">
					<td class="form-col center">
						<select v-if="placeSelection" :value="place" @change.prevent="selectPlace($event.target.value)" required>
							<option v-if="places.indexOf('') < 0" value="" disabled>Miejsce</option>
							<option v-for="place in places" :key="place" :value="place">{{ place }}</option>
						</select>
					</td>
					<td class="form-col center">
						<ul class="list-inline">
							<li v-if="permUSSD" class="list-inline">
								<input v-model="op" type="radio" name="op" value="ussd" id="opUSSD" />
								<label for="opUSSD"> USSD</label>
							</li>
							<li v-if="permSMS" class="list-inline">
								<input v-model="op" type="radio" name="op" value="sms" id="opSMS" />
								<label for="opSMS"> SMS</label>
							</li>
						</ul>
					</td>
					<td class="form-col center">
						<button v-if="getWakeUp(place)" type="button" @click="wakeup(place)" title="Obudź" class="button">
							<font-awesome-icon :icon="iconWakeUp" fixed-width />
						</button>
					</td>
				</tr>
				<tr v-if="op === 'ussd'" class="form-row">
					<td class="form-col">
						<label for="ussd">USSD</label>
					</td>
					<td class="form-col" colspan="2">
						<input v-model="ussd" id="ussd" minlength="1" maxlength="100" placeholder="Kod USSD (aktywacyjny)" :disabled="pendingUSSD" required />
					</td>
				</tr>
				<tr v-if="op === 'ussd'" class="form-row" key="submit">
					<td class="form-col" />
					<td class="form-col" colspan="2">
						<button v-if="!pendingUSSD" type="submit" @click.prevent="submit('Czy na pewno wysłać wpisany kod USSD i ponieść ewentualne opłaty?')" :disabled="working || !ussd">
							<font-awesome-icon :icon="iconSend" />
							Wyślij kod USSD
						</button>
						<button v-else type="reset" class="button-delete" @click.prevent="cancel" :disabled="working">
							<font-awesome-icon :icon="iconDelete" />
							Anuluj wysyłanie kodu USSD
						</button>
					</td>
				</tr>
				<tr v-if="op === 'sms'" class="form-row">
					<td class="form-col">
						<label for="smsTo">SMS do</label>
					</td>
					<td class="form-col" colspan="2">
						<input v-model="smsTo" id="smsTo" minlength="1" maxlength="20" placeholder="+48720720720" title="Numer odbiorcy w formie +48720720720 lub 80820" :disabled="pendingSMS" required />
					</td>
				</tr>
				<tr v-if="op === 'sms'" class="form-row">
					<td class="form-col">
						<label for="sms">Treść</label>
					</td>
					<td class="form-col" colspan="2">
						<textarea v-model="sms" id="sms" rows="4" minlength="1" maxlength="160" placeholder="Treść SMS-a do wysłania" :disabled="pendingSMS" required />
					</td>
				</tr>
				<tr v-if="op === 'sms'" class="form-row" key="submit">
					<td class="form-col" />
					<td class="form-col" colspan="2">
						<button v-if="!pendingSMS" type="submit" @click.prevent="submit('Czy na pewno wysłać SMS i ponieść opłatę zgodnie z cennikiem?')" :disabled="working || !smsTo || !sms">
							<font-awesome-icon :icon="iconSend" />
							Wyślij SMS
						</button>
						<button v-else type="reset" class="button-delete" @click.prevent="cancel" :disabled="working">
							<font-awesome-icon :icon="iconDelete" />
							Anuluj wysyłanie SMS
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<USSDHints :imsi="imsi" v-if="op === 'ussd'" />
	</div>
	<transition name="basic" mode="out-in">
		<table v-if="messages.length" class="striped highlight">
			<tbody>
				<Message v-for="message in messages" :key="message.group + ':' + message.from + ':' + message.name + '@' + message.ts" :message="message" :imsi="imsi" />
			</tbody>
		</table>
	</transition>
</div>
