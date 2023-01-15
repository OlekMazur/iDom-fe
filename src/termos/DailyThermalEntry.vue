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
	<DailyCommonEntry :entry="entry" @change="$emit('change', $event)" />
	<td class="form-col center">
		<EditNumber v-model="entry.temp" min="-100" max="100" :step="step" />
	</td>
	<td class="form-col center">
		<EditNumber v-model="entry.hyst" min="0" max="15" :step="step" />
	</td>
	<td class="form-col center">
		<ButtonDelete @click="$emit('delete', entry)" title="Usuń przedział czasu" />
	</td>
</tr>
