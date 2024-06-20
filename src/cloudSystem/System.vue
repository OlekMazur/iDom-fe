<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2021, 2022, 2024 Aleksander Mazur

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
					{{ placesThings[place] && placesThings[place].alias }}
				</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="center" rowspan="3">
					<font-awesome-icon :icon="faClock" fixed-width />
				</td>
				<td>Ostatni raport</td>
				<td class="center" v-for="place in places" :key="place">
					<Timestamp v-if="timestamp[place]" normal="true" :ts="timestamp[place]" />
				</td>
			</tr>
			<tr>
				<td>Następny raport</td>
				<td class="center" v-for="place in places" :key="place">
					<Timestamp v-if="nextTS[place]" normal="true" :ts="nextTS[place]" />
				</td>
			</tr>
			<tr>
				<td>Liczba raportów</td>
				<td class="center" v-for="place in places" :key="place">
					{{ placesThings[place] && placesThings[place].cnt || '' }}
				</td>
			</tr>
			<tr>
				<td class="center" rowspan="3">
					<font-awesome-icon :icon="faBell" fixed-width />
				</td>
				<td>Obudź</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="orders && orders[place] && orders[place].global && orders[place].global.now || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.wakeup)"
						@switch="cloudWakeUp(place, $event)"
					/>
				</td>
			</tr>
			<tr>
				<td>Raportuj co</td>
				<td class="center" v-for="place in places" :key="place">
					<OptionalNumber
						v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.wakeup"
						:minValue="5" :maxValue="999999" :defaultValue="1800"
						labelDel="Ustaw wartość domyślną"
						labelAdd="Określ własną wartość"
						:value="orders && orders[place] && orders[place].global && orders[place].global.period"
						@input="cloudSetParameter(place, 'period', $event)"
					/>
					<span v-else>{{ orders && orders[place] && orders[place].global && orders[place].global.period || '-' }}</span>
				</td>
			</tr>
			<tr>
				<td>Raportuj nie częściej niż co</td>
				<td class="center" v-for="place in places" :key="place">
					<OptionalNumber
						v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.wakeup"
						:minValue="1" :maxValue="99999" :defaultValue="69"
						labelDel="Ustaw wartość domyślną"
						labelAdd="Określ własną wartość"
						:value="orders && orders[place] && orders[place].global && orders[place].global.minDelay"
						@input="cloudSetParameter(place, 'minDelay', $event)"
					/>
					<span v-else>{{ orders && orders[place] && orders[place].global && orders[place].global.minDelay || '-' }}</span>
				</td>
			</tr>
			<tr>
				<td class="center" rowspan="4">
					<font-awesome-icon :icon="faFilm" fixed-width />
				</td>
				<td>Synchronizacja nagrań</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="orders && orders[place] && orders[place].global && orders[place].global.recListSync || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.recListSync)"
						@switch="cloudSetParameter(place, 'recListSync', $event)"
					/>
				</td>
			</tr>
			<tr>
				<td>Znany zakres nagrań</td>
				<td class="center" v-for="place in places" :key="place">
					{{ orders && orders[place] && orders[place].global && orders[place].global.recMin || '-' }}
					-
					{{ orders && orders[place] && orders[place].global && orders[place].global.recMax || '-' }}
				</td>
			</tr>
			<tr>
				<td>Zamówione nagrania</td>
				<td class="center" v-for="place in places" :key="place">
					<ul class="list-none" v-if="orders && orders[place] && orders[place].video">
						<li v-for="(ext, video) in orders[place].video" :key="video">
							<ButtonDelete @click="cloudCancelOrderVideo(place, video)" title="Anuluj zamówienie" />
							<span>{{ video + '.' + ext }}</span>
						</li>
					</ul>
				</td>
			</tr>
			<tr>
				<td>Naraz nagrań na liście</td>
				<td class="center" v-for="place in places" :key="place">
					<OptionalNumber
						v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.recListSync"
						:minValue="1" :maxValue="9999" :defaultValue="200"
						labelDel="Ustaw wartość domyślną"
						labelAdd="Określ własną wartość"
						:value="orders && orders[place] && orders[place].global && orders[place].global.recListMax"
						@input="cloudSetParameter(place, 'recListMax', $event)"
					/>
					<span v-else>{{ orders && orders[place] && orders[place].global && orders[place].global.recListMax || '-' }}</span>
				</td>
			</tr>
			<tr>
				<td class="center" rowspan="3">
					<font-awesome-icon :icon="faCloudUploadAlt" fixed-width />
				</td>
				<td>Pobieraj klatki do nr</td>
				<td class="center" v-for="place in places" :key="place">
					<OptionalNumber
						v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.wantTN"
						:minValue="0" :maxValue="999" :defaultValue="9"
						labelDel="Nie pobieraj automatycznie żadnych klatek"
						labelAdd="Pobieraj automatycznie 9 pierwszych klatek"
						:value="orders && orders[place] && orders[place].global && orders[place].global.wantTN"
						@input="cloudSetParameter(place, 'wantTN', $event)"
					/>
					<span v-else>{{ orders && orders[place] && orders[place].global && orders[place].global.wantTN || '-' }}</span>
				</td>
			</tr>
			<tr>
				<td>Pobieraj klatki od filmu nr</td>
				<td class="center" v-for="place in places" :key="place">
					<OptionalNumber
						v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.recMinTN"
						:minValue="0" :maxValue="99999999"
						:defaultValue="orders && orders[place] && orders[place].global && typeof orders[place].global.recMax === 'number' && (orders[place].global.recMax + 1) || 0"
						labelDel="Pobieraj automatycznie klatki wszystkich filmów"
						labelAdd="Pobieraj automatycznie klatki dopiero nowo nagranych filmów"
						:value="orders && orders[place] && orders[place].global && orders[place].global.recMinTN"
						@input="cloudSetParameter(place, 'recMinTN', $event)"
					/>
					<span v-else>{{ orders && orders[place] && orders[place].global && orders[place].global.recMinTN || '-' }}</span>
				</td>
			</tr>
			<tr>
				<td>Domówione klatki</td>
				<td class="center" v-for="place in places" :key="place">
					<ul class="list-none" v-if="orders && orders[place] && orders[place].global && orders[place].global.tn">
						<li v-for="(want, video) in orders[place].global.tn" :key="tn">
							<ButtonDelete @click="cloudCancelOrderVideoTN(place, video)" title="Anuluj zamówienie" />
							<span>{{ video }}&nbsp;{{ want }}</span>
						</li>
					</ul>
				</td>
			</tr>
			<tr>
				<td class="center" rowspan="3">
					<font-awesome-icon :icon="faFileAlt" fixed-width />
				</td>
				<td>Synchronizacja dzienników</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="orders && orders[place] && orders[place].global && orders[place].global.logsSync || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.logsSync)"
						@switch="cloudSetParameter(place, 'logsSync', $event)"
					/>
				</td>
			</tr>
			<tr>
				<td>Zsynchronizowano dzienniki</td>
				<td class="center" v-for="place in places" :key="place">
					<Timestamp v-if="orders && orders[place] && orders[place].global && orders[place].global.logsTS" normal="true" :ts="orders[place].global.logsTS">
						<template v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.logsSync">
							<br />
							<ButtonDelete @click="cloudLogsForceSync(place)" title="Odśwież" />
						</template>
					</Timestamp>
				</td>
			</tr>
			<tr>
				<td>Zamówione dzienniki</td>
				<td class="center" v-for="place in places" :key="place">
					<ul class="list-none" v-if="orders && orders[place] && orders[place].logs">
						<li v-for="(order, log) in orders[place].logs" :key="log">
							<ToggleSwitch
								:state="order || false"
								:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.order)"
								@switch="cloudOrderLog(place, log, $event)"
							/>
							<span>{{ log }}</span>
						</li>
					</ul>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faFileUpload" fixed-width />
				</td>
				<td>Synchronizacja plików</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch
						:state="orders && orders[place] && orders[place].global && orders[place].global.fileSync || false"
						:disabled="!(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.fileSync)"
						@switch="cloudSetParameter(place, 'fileSync', $event)"
					/>
				</td>
			</tr>
			<tr>
				<td class="center">
					<a :href="upgradeURL" target="_blank">
						<font-awesome-icon :icon="faUpload" fixed-width />
					</a>
				</td>
				<td>
					<a :href="upgradeURL" target="_blank">
						Aktualizacja
					</a>
				</td>
				<td class="center" v-for="place in places" :key="place">
					<ToggleSwitch v-if="upgradeQueries[place]"
						:state="upgrades && upgrades[place] && upgrades[place].load || false"
						:disabled="working || !(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.upgrade)"
						@switch="cloudFirmwareUpgrade(place, $event ? upgradeURL : undefined)"
					/>
					{{ ' ' }}
					<ButtonDelete v-if="upgrades && upgrades[place] && (upgrades[place].url || upgrades[place].path)"
						@click="cloudFirmwareUpgrade(place)" title="Wyczyść zlecenie aktualizacji"
					/>
				</td>
			</tr>
			<tr v-for="request in permittedPOST">
				<td class="center">
					<font-awesome-icon :icon="faCog" fixed-width />
				</td>
				<td>POST <span class="italic">{{ request }}</span></td>
				<td class="center" v-for="place in places" :key="place">
					<span :title="orders && orders[place] && orders[place].global && orders[place].global.post && orders[place].global.post[request] || ''">
						<ToggleSwitch
							:state="orders && orders[place] && orders[place].global && orders[place].global.post && typeof orders[place].global.post[request] === 'string' || false"
							:disabled="working || !(placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.post && placesThings[place].permissions.post[request])"
							@switch="cloudRequestPOST(place, request, $event ? '' : undefined)"
						/>
					</span>
					<template v-if="paramsPOST[request] && placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.post && placesThings[place].permissions.post[request]">
						{{ ' ' }}
						<span v-for="param in paramsPOST[request]" class="button" @click="cloudRequestPOST(place, request, param.args)" :title="param.label">
							<font-awesome-icon :icon="param.icon" fixed-width />
						</span>
					</template>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faPlug" fixed-width />
				</td>
				<td>Urządzenia do przełączenia</td>
				<td class="center" v-for="place in places" :key="place">
					<ul class="list-none" v-if="orders && orders[place] && orders[place].global && orders[place].global.d">
						<li v-for="(want, device) in orders[place].global.d" :key="device">
							<ButtonDelete @click="cloudSwitchDevice(place, device, null)" title="Anuluj przełączenie" />
							<ToggleSwitch :state="want" :disabled="true" />
							<span> {{ device }}</span>
						</li>
					</ul>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faInfo" fixed-width />
				</td>
				<td>Zmienne do przestawienia</td>
				<td class="center" v-for="place in places" :key="place">
					<ul class="list-none" v-if="orders && orders[place] && orders[place].global && orders[place].global.v">
						<li v-for="(want, variable) in orders[place].global.v" :key="variable">
							<ButtonDelete @click="cloudRenameThing(place, 'variables', variable, null)" title="Anuluj przestawienie" />
							<span> {{ variable }}&nbsp;{{ want }}</span>
						</li>
					</ul>
				</td>
			</tr>
			<tr>
				<td class="center">
					<font-awesome-icon :icon="faUserSecret" fixed-width />
				</td>
				<td>Zmiana nazwy urządzeń</td>
				<td class="center" v-for="place in places" :key="place">
					<ul class="list-none" v-if="orders && orders[place] && orders[place].global && orders[place].global.n">
						<li v-for="(want, device) in orders[place].global.n" :key="device">
							<ButtonDelete @click="cloudRenameThing(place, 'devices', device, null)" title="Anuluj zmianę nazwy" />
							<span> {{ device }}&nbsp;{{ want }}</span>
						</li>
					</ul>
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
</div>
