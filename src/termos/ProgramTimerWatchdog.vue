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
	<td class="form-col"></td>
	<td class="form-col"></td>
	<td class="form-col"></td>
	<td class="form-col"></td>
	<td class="center" title="Program zegarowy">
		<font-awesome-icon :icon="faClock" fixed-width />
	</td>
	<td class="form-col"><SelectProgram v-model="termos.timer[1]" :options="programs" /></td>
	<td class="form-col"><SelectProgram v-model="termos.timer[2]" :options="programs" /></td>
	<td class="form-col"><SelectProgram v-model="termos.timer[3]" :options="programs" /></td>
	<td class="form-col"><SelectProgram v-model="termos.timer[4]" :options="programs" /></td>
	<td class="form-col"><SelectProgram v-model="termos.timer[5]" :options="programs" /></td>
	<td class="form-col"><SelectProgram v-model="termos.timer[6]" :options="programs" /></td>
	<td class="form-col"><SelectProgram v-model="termos.timer[0]" :options="programs" /></td>
	<td class="center" title="Watchdog">
		<font-awesome-icon :icon="faDog" fixed-width />
	</td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x80)" @switch="termos.watchdog = setBit(termos.watchdog, 7, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x40)" @switch="termos.watchdog = setBit(termos.watchdog, 6, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x20)" @switch="termos.watchdog = setBit(termos.watchdog, 5, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x10)" @switch="termos.watchdog = setBit(termos.watchdog, 4, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x08)" @switch="termos.watchdog = setBit(termos.watchdog, 3, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x04)" @switch="termos.watchdog = setBit(termos.watchdog, 2, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x02)" @switch="termos.watchdog = setBit(termos.watchdog, 1, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(termos.watchdog & 0x01)" @switch="termos.watchdog = setBit(termos.watchdog, 0, $event)" /></td>
	<td class="form-col center"></td>
</tr>
