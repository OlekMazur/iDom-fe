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

<tbody>
	<tr class="form-row">
		<DailyCommonEntry rowspan="3" :entry="entry" @change="$emit('change', $event)" />
		<td class="form-col center">Załącz</td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x80)" @switch="entry.relaysOn = setBit(entry.relaysOn, 7, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x40)" @switch="entry.relaysOn = setBit(entry.relaysOn, 6, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x20)" @switch="entry.relaysOn = setBit(entry.relaysOn, 5, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x10)" @switch="entry.relaysOn = setBit(entry.relaysOn, 4, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x08)" @switch="entry.relaysOn = setBit(entry.relaysOn, 3, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x04)" @switch="entry.relaysOn = setBit(entry.relaysOn, 2, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x02)" @switch="entry.relaysOn = setBit(entry.relaysOn, 1, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOn & 0x01)" @switch="entry.relaysOn = setBit(entry.relaysOn, 0, $event)" /></td>
		<td class="form-col center" rowspan="3"><ButtonDelete @click="$emit('delete', entry)" title="Usuń przedział czasu" /></td>
	</tr>
	<tr>
		<td class="form-col center">Wyłącz</td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x80)" @switch="entry.relaysOff = setBit(entry.relaysOff, 7, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x40)" @switch="entry.relaysOff = setBit(entry.relaysOff, 6, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x20)" @switch="entry.relaysOff = setBit(entry.relaysOff, 5, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x10)" @switch="entry.relaysOff = setBit(entry.relaysOff, 4, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x08)" @switch="entry.relaysOff = setBit(entry.relaysOff, 3, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x04)" @switch="entry.relaysOff = setBit(entry.relaysOff, 2, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x02)" @switch="entry.relaysOff = setBit(entry.relaysOff, 1, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOff & 0x01)" @switch="entry.relaysOff = setBit(entry.relaysOff, 0, $event)" /></td>
	</tr>
	<tr>
		<td class="form-col center">Naciś</td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x80)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 7, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x40)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 6, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x20)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 5, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x10)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 4, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x08)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 3, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x04)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 2, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x02)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 1, $event)" /></td>
		<td class="form-col center"><ToggleSwitch :state="!!(entry.relaysOnce & 0x01)" @switch="entry.relaysOnce = setBit(entry.relaysOnce, 0, $event)" /></td>
	</tr>
</tbody>
