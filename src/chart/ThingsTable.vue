<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2021 Aleksander Mazur

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

<table class="striped highlight">
	<thead>
		<tr>
			<th><font-awesome-icon :icon="faQuestion" fixed-width /></th>
			<th>Nazwa</th>
			<th v-if="places.length === 1 && !places[0]" class="center"><font-awesome-icon :icon="faChartArea" fixed-width /></th>
			<th v-else v-for="place in places" class="center">
				<ToggleSwitch :state="placeSelect[place]" @switch="$emit('select-place', { place, value: $event })" />
				{{ place }}
				<span v-if="getWakeUp(place)" title="Obudź" class="button" @click="wakeup(place)">
					<font-awesome-icon :icon="faBell" fixed-width />
				</span>
			</th>
		</tr>
	</thead>
	<tbody>
		<tr v-for="group in devices" v-if="deviceInfo && group.important" :key="group.name">
			<td>
				<font-awesome-icon v-if="places && places.length > 0" :icon="group.icon" fixed-width />
			</td>
			<td>{{ group.name }}</td>
			<ThingCell v-for="place in places" :key="place"
				:thing="deviceState[getThingID(place, group)]" :info="deviceInfo[getThingID(place, group)]"
				:canChangeColor="placesThings[place].permissions && placesThings[place].permissions.color"
				@change-color="changeColor(place, 'devices', group, $event)"
				@select-thing="$emit('select-thing', { type: 'devices', id: getThingID(place, group), value: $event })"
			/>
		</tr>
		<tr v-for="group in sensors" v-if="sensorInfo && group.important" :key="group.name">
			<td>
				<font-awesome-icon v-if="places && places.length > 0" :icon="group.icon" fixed-width />
			</td>
			<td>{{ group.name }}</td>
			<ThingCell v-for="place in places" :key="place"
				:thing="sensorState[getThingID(place, group)]" :info="sensorInfo[getThingID(place, group)]"
				:canChangeColor="placesThings[place].permissions && placesThings[place].permissions.color"
				@change-color="changeColor(place, 'sensors', group, $event)"
				@select-thing="$emit('select-thing', { type: 'sensors', id: getThingID(place, group), value: $event })"
			/>
		</tr>
	</tbody>
</table>
