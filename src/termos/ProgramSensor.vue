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

<tr class="form-row">
	<td class="form-col"><SelectSensor v-model="func.sensor" :mapping="mapping" /></td>
	<td class="form-col"><SelectOptionalSensor v-model="func.diff" :mapping="mapping" /></td>
	<td class="form-col center">
		<font-awesome-icon :icon="faFire" fixed-width title="Ogrzewanie" />
		<ToggleSwitch v-model="func.cooling" />
		<font-awesome-icon :icon="faSnowflake" fixed-width title="Chłodzenie" />
	</td>
	<td class="form-col center"><ToggleSwitch v-model="func.critical" /></td>
	<td class="form-col center"><ToggleSwitch v-model="func.display" /></td>
	<td class="form-col"><SelectProgram v-model="func.programs[1]" :options="progIDs" /></td>
	<td class="form-col"><SelectProgram v-model="func.programs[2]" :options="progIDs" /></td>
	<td class="form-col"><SelectProgram v-model="func.programs[3]" :options="progIDs" /></td>
	<td class="form-col"><SelectProgram v-model="func.programs[4]" :options="progIDs" /></td>
	<td class="form-col"><SelectProgram v-model="func.programs[5]" :options="progIDs" /></td>
	<td class="form-col"><SelectProgram v-model="func.programs[6]" :options="progIDs" /></td>
	<td class="form-col"><SelectProgram v-model="func.programs[0]" :options="progIDs" /></td>
	<td class="form-col center bold">
		<OptionalNumber v-model="func.formula" minValue="0" maxValue="7"
			labelDel="Nie steruj żadną formułą"
			labelAdd="Steruj jakąś formułą"
		/>
	</td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x80)" @switch="func.relays = setBit(func.relays, 7, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x40)" @switch="func.relays = setBit(func.relays, 6, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x20)" @switch="func.relays = setBit(func.relays, 5, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x10)" @switch="func.relays = setBit(func.relays, 4, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x08)" @switch="func.relays = setBit(func.relays, 3, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x04)" @switch="func.relays = setBit(func.relays, 2, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x02)" @switch="func.relays = setBit(func.relays, 1, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(func.relays & 0x01)" @switch="func.relays = setBit(func.relays, 0, $event)" /></td>
	<td class="form-col center"><ButtonDelete @click="$emit('delete', func)" title="Usuń program czujnika" /></td>
</tr>
