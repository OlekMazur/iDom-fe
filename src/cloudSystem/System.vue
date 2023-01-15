<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2021, 2022 Aleksander Mazur

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
	<table class="striped highlight">
		<thead>
			<tr>
				<th class="center">
					<font-awesome-icon :icon="faQuestion" fixed-width />
				</th>
				<th>Miejsce</th>
				<th class="center" v-for="place in places" :key="place">
					{{ place }}
					<span v-if="getWakeUp(place)" title="Obudź" class="button" @click="wakeup(place)">
						<font-awesome-icon :icon="faBell" fixed-width />
					</span>
					<span v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.wakeup"
						title="Zakończ sesję budzenia" class="button" @click="resetWakeup(place)">
						<font-awesome-icon :icon="faBellSlash" fixed-width />
					</span>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faClock" fixed-width />
				</td>
				<td>Ostatni kontakt</td>
				<td class="center" v-for="place in places" :key="place">
					{{ formatDate(place) }}<br/>{{ formatTime(place) }}
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faCog" fixed-width />
				</td>
				<td>Bieżące zlecenie</td>
				<td class="center" v-for="place in places" :key="place">
					{{ placesThings[place] && placesThings[place].request && placesThings[place].request.type || '' }}
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faCog" fixed-width />
				</td>
				<td>Dane zlecenia</td>
				<td v-for="place in places" :key="place">
					<RequestData
						v-if="placesThings[place] && placesThings[place].request && placesThings[place].request.data"
						:data="placesThings[place].request.data"
					/>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faFilm" fixed-width />
				</td>
				<td>Synchronizacja nagrań</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="placesThings[place] && placesThings[place].request && placesThings[place].request.recListSync || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.recListSync)"
						@switch="setRecListSync(place, $event)"
					/>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faFilm" fixed-width />
				</td>
				<td>Znany zakres nagrań</td>
				<td class="center" v-for="place in places" :key="place">
					{{ placesThings[place] && placesThings[place].request && placesThings[place].request.recMin || '-' }}
					-
					{{ placesThings[place] && placesThings[place].request && placesThings[place].request.recMax || '-' }}
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faCloudUploadAlt" fixed-width />
				</td>
				<td>Pobieraj klatki do nr</td>
				<td class="center" v-for="place in places" :key="place">
					<OptionalNumber
						v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.maxTN"
						:minValue="0" :maxValue="100" :defaultValue="9"
						labelDel="Nie pobieraj automatycznie żadnych klatek"
						labelAdd="Pobieraj automatycznie 9 pierwszych klatek"
						:value="placesThings[place] && placesThings[place].request && placesThings[place].request.maxTN"
						@input="setMaxTN(place, $event)"
					/>
					<span v-else>{{ placesThings[place] && placesThings[place].request && placesThings[place].request.maxTN || '-' }}</span>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faCloudUploadAlt" fixed-width />
				</td>
				<td>Pobieraj tyle klatek naraz</td>
				<td class="center" v-for="place in places" :key="place">
					<OptionalNumber
						v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.maxTN"
						:minValue="1" :maxValue="100" :defaultValue="30"
						labelDel="Pobieraj klatki pojedynczo, jak dawniej"
						labelAdd="Pobieraj po 30 klatek naraz"
						:value="placesThings[place] && placesThings[place].request && placesThings[place].request.maxTNAtOnce"
						@input="setMaxTNAtOnce(place, $event)"
					/>
					<span v-else>{{ placesThings[place] && placesThings[place].request && placesThings[place].request.maxTNAtOnce || '-' }}</span>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faSignature" fixed-width />
				</td>
				<td>Nie podpisuj linków</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="placesThings[place] && placesThings[place].request && placesThings[place].request.oauthTN || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.oauthTN)"
						@switch="setOauthTN(place, $event)"
					/>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faFileVideo" fixed-width />
				</td>
				<td>Zamówione filmy</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch :state="placesThings[place] && placesThings[place].request && placesThings[place].request.order || false" disabled="true" />
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faFileImage" fixed-width />
				</td>
				<td>Zamówione klatki</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch :state="placesThings[place] && placesThings[place].request && placesThings[place].request.wantTN || false" disabled="true" />
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faFileUpload" fixed-width />
				</td>
				<td>Synchronizacja plików</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="placesThings[place] && placesThings[place].request && placesThings[place].request.fileSync || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.fileSync)"
						@switch="setFileSync(place, $event)"
					/>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faFileAlt" fixed-width />
				</td>
				<td>Synchronizacja logów</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="placesThings[place] && placesThings[place].request && placesThings[place].request.logListSync || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.logListSync)"
						@switch="setLogListSync(place, $event)"
					/>
				</td>
			</tr>
			<tr v-for="generic in rows" :key="generic">
				<td class="center" title="Zamówienie">
					<font-awesome-icon :icon="faEnvelope" fixed-width />
				</td>
				<td>{{ generic }}</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch v-if="generics[generic][place] !== undefined" :state="generics[generic][place]" @switch="orderGeneric(place, generic, $event)" />
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faDownload" fixed-width />
				</td>
				<td>Wybór aktualizacji</td>
				<td class="center" v-for="place in places" :key="place">
					<select v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.upgrade"
						:value="placesThings[place] && placesThings[place].request && placesThings[place].request.upgradeOption"
						@change.prevent="upgradeSelect(place, $event.target.value)">
						<option v-for="(allowed, upgrade) in placesThings[place].permissions.upgrade" v-if="allowed" :key="upgrade" :value="upgrade">{{ upgrade }}</option>
					</select>
					<template v-else>
						{{ placesThings[place] && placesThings[place].request && placesThings[place].request.upgradeOption || '' }}
					</template>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faDownload" fixed-width />
				</td>
				<td>Status aktualizacji</td>
				<td class="center" v-for="place in places" :key="place">
					{{ placesThings[place] && placesThings[place].request && placesThings[place].request.upgradeState || '' }}
					<template v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.upgrade">
						<template v-if="placesThings[place] && placesThings[place].request && placesThings[place].request.upgradeState">
							<span class="button" @click="upgradeStop(place)" title="Zatrzymaj">
								<font-awesome-icon :icon="faStop" fixed-width />
							</span>
						</template>
						<template v-else>
							<span class="button" @click="upgradeStart(place)" title="Rozpocznij">
								<font-awesome-icon :icon="faPlay" fixed-width />
							</span>
						</template>
					</template>
				</td>
			</tr>
		</tbody>
	</table>
	<hr />
	<p class="center bold">Historia rzeczy
		<CollapseExpand
			:state="showThings"
			@switch="showThings = $event"
		/>
	</p>
	<Things v-if="showThings" :placesThings="placesThings" />
	<hr />
	<p class="center bold">Żeton
		<CollapseExpand
			:state="showToken"
			@switch="showToken = $event"
		/>
	</p>
	<Token v-if="showToken" />
</div>
