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

<tr class="form-row">
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x80)" @switch="formula.mask1 = setBit(formula.mask1, 7, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x40)" @switch="formula.mask1 = setBit(formula.mask1, 6, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x20)" @switch="formula.mask1 = setBit(formula.mask1, 5, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x10)" @switch="formula.mask1 = setBit(formula.mask1, 4, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x08)" @switch="formula.mask1 = setBit(formula.mask1, 3, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x04)" @switch="formula.mask1 = setBit(formula.mask1, 2, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x02)" @switch="formula.mask1 = setBit(formula.mask1, 1, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask1 & 0x01)" @switch="formula.mask1 = setBit(formula.mask1, 0, $event)" /></td>
	<td class="form-col center"><font-awesome-icon :icon="faLongArrowAltRight" fixed-width /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x80)" @switch="formula.mask2 = setBit(formula.mask2, 7, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x40)" @switch="formula.mask2 = setBit(formula.mask2, 6, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x20)" @switch="formula.mask2 = setBit(formula.mask2, 5, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x10)" @switch="formula.mask2 = setBit(formula.mask2, 4, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x08)" @switch="formula.mask2 = setBit(formula.mask2, 3, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x04)" @switch="formula.mask2 = setBit(formula.mask2, 2, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x02)" @switch="formula.mask2 = setBit(formula.mask2, 1, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.mask2 & 0x01)" @switch="formula.mask2 = setBit(formula.mask2, 0, $event)" /></td>
	<td class="form-col center"><font-awesome-icon :icon="faLongArrowAltRight" fixed-width /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x80)" @switch="formula.relays = setBit(formula.relays, 7, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x40)" @switch="formula.relays = setBit(formula.relays, 6, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x20)" @switch="formula.relays = setBit(formula.relays, 5, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x10)" @switch="formula.relays = setBit(formula.relays, 4, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x08)" @switch="formula.relays = setBit(formula.relays, 3, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x04)" @switch="formula.relays = setBit(formula.relays, 2, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x02)" @switch="formula.relays = setBit(formula.relays, 1, $event)" /></td>
	<td class="form-col center"><ToggleSwitch :state="!!(formula.relays & 0x01)" @switch="formula.relays = setBit(formula.relays, 0, $event)" /></td>
	<td class="form-col center"><ButtonDelete @click="$emit('delete', formula)" title="Usuń formułę sterowania pośredniego" /></td>
</tr>
