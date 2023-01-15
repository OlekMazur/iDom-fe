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

<td class="center chart-cell" :class="clazz">
	<template v-if="thing">
		<!--<input type="checkbox" :checked="thing.selected" @change.prevent="$emit('select-thing', $event.target.checked)" />-->
		<ToggleSwitch :state="thing.selected" @switch="$emit('select-thing', $event)" />
		<input type="color" :disabled="!canChangeColor" :value="info.color" @change.prevent="$emit('change-color', $event.target.value)" />
	</template>
</td>
