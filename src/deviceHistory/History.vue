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

<div>
	<div class="menu">
		<table class="center">
			<tbody>
				<TimeRangeSelRow storagePrefix="history" :waiting="waiting" :rangeX="rangeX" @input="posXEnd = $event">
					<td class="form-col">
						<label for="device">Urządzenie</label>
						<select v-model="device" id="device" :disabled="!placeDevices" required>
							<optgroup v-if="placeDevices" v-for="(data, place) in placeDevices" :key="place" :label="place">
								<option v-if="data.devices" v-for="device in data.devices" :key="device.id" :value="'devices/' + buildGlobalThingID(place, device.id)">{{ device.label }}</option>
								<template v-if="data.sensors && data.sensors.length">
									<option disabled>Czujniki</option>
									<option v-for="device in data.sensors" :key="device.id" :value="'devices/' + buildGlobalThingID(place, device.id)">{{ device.label }}</option>
								</template>
							</optgroup>
						</select>
					</td>
					<td class="form-col">
						<label for="tableType">Tabela</label>
						<select v-model="tableType" id="tableType" required>
							<option value="raw">w(y)łączenia</option>
							<option value="cycles">cykle pracy</option>
						</select>
					</td>
					<TimeRangeSelCol storagePrefix="history" @input="rangeX = $event" />
				</TimeRangeSelRow>
			</tbody>
		</table>
	</div>
	<transition name="basic" mode="out-in">
		<DeviceCycles v-if="tableType === 'cycles' && history.length"
			:history="history" :device="device" :deletableShorterThan="deletableShorterThan"
		/>
		<DeviceSwitchings v-if="tableType === 'raw' && history.length"
			:history="history" :device="device" :deletableShorterThan="deletableShorterThan"
		/>
	</transition>
</div>
