<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019 Aleksander Mazur

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
	<svg class="chart" :width="size.width" :height="size.height" ref="svg" @mousemove="mouseMove" @mouseleave="mouseOut">
		<g>
			<line v-if="mouseY >= 0 && mouseY <= size.height - CHART_OFFSET_BOTTOM"
				:x1="CHART_OFFSET_X - 2" :x2="size.width - CHART_OFFSET_X + 2"
				:y1="mouseY" :y2="mouseY"
			/>
			<line v-if="mouseX >= CHART_OFFSET_X && mouseX <= size.width - CHART_OFFSET_X"
				:y1="0" :y2="size.height - CHART_OFFSET_BOTTOM + 2"
				:x1="mouseX" :x2="mouseX"
			/>
			<path :d="grid.lines" class="chart-grid-line" />
			<path :d="grid.linesBold" class="chart-grid-line-bold" />
			<path class="chart-device-plot" v-for="(device, id) in devices" v-if="allDevices[id]"
				:key="'device-' + id" :d="device.plot" :style="{ fill: allDevices[id].color }">
				<title>{{ allDevices[id].label }}</title>
			</path>
			<path class="chart-sensor-plot" v-for="(sensor, id) in sensors" v-if="allSensors[id]"
				:key="'sensor-' + id" :d="sensor.plot" :style="{ stroke: allSensors[id].color }">
				<title>{{ allSensors[id].label }}</title>
			</path>
			<text class="chart-unit" x="0" :y="size.height - 2">[{{ unit }}]</text>
			<text v-for="label in grid.labelsV"
				class="chart-grid-label" :class="label.clazz"
				:x="label.pos" :y="size.height - CHART_OFFSET_BOTTOM + 2"
				:transform="'rotate(-90 ' + label.pos + ' ' + (size.height - CHART_OFFSET_BOTTOM + 2) + ')'"
				>{{ label.label }}</text>
			<text v-for="label in grid.labelsH"
				class="chart-grid-label" :class="label.clazz"
				:y="label.pos" :x="CHART_OFFSET_X - 2"
				>{{ label.label }}</text>
			<text v-for="label in grid.labelsH"
				class="chart-grid-label-right" :class="label.clazz"
				:y="label.pos" :x="size.width - CHART_OFFSET_X + 2"
				>{{ label.label }}</text>
		</g>
	</svg>
	<div class="menu">
		<table class="center">
			<tbody>
				<TimeRangeSelRow storagePrefix="chart" :waiting="waiting" :rangeX="rangeX" @input="posXEnd = $event">
					<td class="form-col">
						<label for="deviceHistory">Urządzenia</label>
						<select v-model="deviceHistory" id="deviceHistory" required>
							<option value="1D">jednowymiarowo</option>
							<option value="2D">dwuwymiarowo (cyklami)</option>
						</select>
					</td>
					<td class="form-col">
						<input v-model="posYAuto" type="checkbox" id="posYAuto" />
						<label for="posYAuto"> Automatyczny zakres wartości</label>
						{{ posYFormatted }}
					</td>
					<td class="form-col">
						<label for="unit">Jednostka</label>
						<select v-model="unit" id="unit" :disabled="!units || !units.length" required>
							<option v-for="unit in units" :key="unit">{{ unit }}</option>
						</select>
					</td>
					<TimeRangeSelCol storagePrefix="chart" @input="rangeX = $event" />
				</TimeRangeSelRow>
			</tbody>
		</table>
	</div>
	<ThingsTable :placesThings="placesThings" :places="places" :placeSelect="placeSelect"
		:devices="devicesOrdered" :deviceInfo="allDevices" :deviceState="devices"
		:sensors="sensorsOrdered" :sensorInfo="allSensors" :sensorState="sensors"
		@select-thing="selectThing($event.type, $event.id, $event.value)"
		@select-place="selectPlace($event.place, $event.value)"
	/>
</div>
