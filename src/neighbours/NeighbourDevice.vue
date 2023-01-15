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

<tr>
	<td class="center">
		<div class="big">
			<font-awesome-icon v-if="nd.icon" :icon="nd.icon" fixed-width />
			<font-awesome-icon :icon="nd.thing.state ? iconOn : iconOff" :title="nd.thing.state ? 'Widoczne' : 'Znikło'" fixed-width />
		</div>
		<Timestamp :ts="nd.thing.ts" :baseTS="nd.baseTS" :timeout="timeout" />
		<div class="bold">{{ nd.place }}</div>
	</td>
	<td>
		<div>
			<SensorDeviceForm type="neighbours" :place="nd.place" :id="nd.id" :thing="nd.thing" :permissions="nd.permissions" />
		</div>
		<div v-if="nd.props.hasOwnProperty('name')" class="bold">{{ nd.props.name.value }}</div>
		<div v-if="clsStr">{{ clsStr }}</div>
		<div v-if="services" class="small">
			<ul class="list-inline">
				<li v-for="service in services" class="list-inline">{{ service }}</li>
			</ul>
		</div>
		<div v-if="url || rssi || nd.props.hasOwnProperty('mode')">
			<ul class="list-inline">
				<li v-if="nd.props.hasOwnProperty('mode')" class="list-inline">
					Tryb <span class="bold">{{ nd.props.mode.value }}</span>
				</li>
				<li v-if="rssi" class="list-inline small">Sygnał <span class="bold">{{ rssi }}</span></li>
				<li v-if="url" class="list-inline small"><a :href="url">Link</a></li>
			</ul>
		</div>
	</td>
	<slot />
</tr>
