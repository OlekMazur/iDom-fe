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

<table class="striped highlight">
	<thead>
		<tr v-if="cycles || summary">
			<th class="center">#</th>
			<th class="center">Początek cyklu</th>
			<th class="center" colspan="2">Praca</th>
			<th class="center" colspan="2">Przerwa</th>
			<th class="center">Łącznie</th>
		</tr>
	</thead>
	<tbody>
		<DeviceCycle v-if="cycles" v-for="(entry, index) in cycles"
			:key="entry.ts" :entry="entry" :index="cycles.length - index"
			:deletableShorterThan="deletableShorterThan"
			@deleteOnTime="deleteEntries(entry.ts, entry.ts + entry.on)"
			@deleteOffTime="deleteEntries(entry.ts + entry.on, entry.ts + entry.total)"
		/>
	</tbody>
	<tfoot>
		<tr v-if="summary">
			<th class="center"></th>
			<th>Podsumowanie</th>
			<th>{{ summaryOn }}</th>
			<th class="center bold">{{ percentOn }}</th>
			<th>{{ summaryOff }}</th>
			<th class="center">{{ percentOff }}</th>
			<th>{{ elapsedTotal }}</th>
		</tr>
	</tfoot>
</table>
