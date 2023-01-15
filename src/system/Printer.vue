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

<tr :title="data.name">
	<td class="center"><font-awesome-icon :icon="icon" :class="blink" /></td>
	<td class="min-width">
		<div v-if="data.manufacturer || data.modelName">{{ data.manufacturer }} {{ data.modelName }}</div>
		<div v-if="data.description" class="small">{{ data.description }}</div>
	</td>
	<td class="min-width">
		{{ data.commandSet }}
		{{ data.commandSet && data.memory ? ', ' : '' }}
		{{ data.memory }}
	</td>
</tr>
