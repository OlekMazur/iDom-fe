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
		<tr class="form-row">
			<th class="form-col center">Od godziny</th>
			<th class="form-col center">Operacja</th>
			<th class="form-col center">{{ describeRelay(7) }}</th>
			<th class="form-col center">{{ describeRelay(6) }}</th>
			<th class="form-col center">{{ describeRelay(5) }}</th>
			<th class="form-col center">{{ describeRelay(4) }}</th>
			<th class="form-col center">{{ describeRelay(3) }}</th>
			<th class="form-col center">{{ describeRelay(2) }}</th>
			<th class="form-col center">{{ describeRelay(1) }}</th>
			<th class="form-col center">{{ describeRelay(0) }}</th>
			<th class="form-col center">
				<ButtonAdd @click="addEntry" title="Dodaj przedział czasu" />
			</th>
		</tr>
	</thead>
	<DailyTimerEntry v-for="(entry, index) in program" :key="index" :entry="entry" @delete="deleteEntry(index)" @change="sortEntries" />
</table>
