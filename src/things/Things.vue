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

<table v-if="places.length" class="striped highlight">
	<thead>
		<tr>
			<th class="center vcenter">
				<font-awesome-icon :icon="faQuestion" fixed-width />
			</th>
			<th class="vcenter">Nazwa</th>
			<th class="center vcenter" v-for="place in places" :key="place">
				{{ placesThings[place] && placesThings[place].alias }}
				<span v-if="placesThings[place] && placesThings[place].permissions && placesThings[place].permissions.wakeup" title="Obudź" class="button" @click="wakeup(place)">
					<font-awesome-icon :icon="faBell" fixed-width />
				</span>
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="center vcenter">
				<font-awesome-icon :icon="faClock" fixed-width />
			</td>
			<td class="vcenter">Stan w chwili</td>
			<td class="center" v-for="place in places" :key="place">
				<Timestamp v-if="timestamp[place].ts" normal="true" :ts="timestamp[place].ts">
					<template v-if="now > timestamp[place].tsSV + timestamp[place].next">
						<br />
						<span class="big" title="Czas kontaktu minął">
							<font-awesome-icon :icon="faExclamationTriangle" class="blink" />
						</span>
					</template>
				</Timestamp>
			</td>
		</tr>
		<tr v-for="group in devices" v-if="group.important" :key="group.name">
			<td class="center vcenter" title="Urządzenie">
				<font-awesome-icon :icon="group.icon" fixed-width />
			</td>
			<td v-if="group.single !== undefined" class="vcenter">
				<SensorDeviceForm type="devices"
					:place="group.single"
					:alias="placesThings[group.single] && placesThings[group.single].alias"
					:id="group.idAt[group.single]"
					:thing="getThing('devices', group, group.single)"
					:permissions="placesThings[group.single] && placesThings[group.single].permissions"
				/>
			</td>
			<td v-else class="vcenter">{{ group.name }}</td>
			<DeviceCell v-for="place in places" :key="place" :place="place"
				:id="group.idAt[place]"
				:thing="getThing('devices', group, place)"
				:ts="timestamp[place].ts"
				:switchable="placesThings[place] && placesThings[place].permissions ? placesThings[place].permissions.device : true"
			/>
		</tr>
		<tr v-for="group in sensors" v-if="group.important" :key="group.name">
			<td class="center vcenter" title="Czujnik">
				<font-awesome-icon :icon="group.icon" fixed-width />
			</td>
			<td v-if="group.single !== undefined" class="vcenter">
				<SensorDeviceForm type="sensors"
					:place="group.single"
					:alias="placesThings[group.single] && placesThings[group.single].alias"
					:id="group.idAt[group.single]"
					:thing="getThing('sensors', group, group.single)"
					:permissions="placesThings[group.single] && placesThings[group.single].permissions"
				/>
			</td>
			<td v-else class="vcenter">{{ group.name }}</td>
			<SensorCell v-for="place in places" :key="place" :thing="getThing('sensors', group, place)" :ts="timestamp[place].ts" :termostat="termostat" />
		</tr>
		<tr v-for="group in variables" :key="group.name">
			<td class="center vcenter" title="Parametr">
				<font-awesome-icon :icon="group.icon" fixed-width />
			</td>
			<VariableHeader :name="group.name" class="vcenter" />
			<VariableCell v-for="place in places" :key="place" :place="place"
				:thing="getThing('variables', group, place)"
				:ts="timestamp[place].ts"
				:permissions="placesThings[place] && placesThings[place].permissions"
			/>
		</tr>
	</tbody>
</table>
