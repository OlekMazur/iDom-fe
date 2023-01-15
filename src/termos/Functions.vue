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

<div>
	<h1>Programy czujników</h1>
	<table class="striped highlight">
		<thead>
			<tr class="form-row">
				<th class="form-col">Czujnik</th>
				<th class="form-col">Różnica względem</th>
				<th class="form-col center">Chłodzenie</th>
				<th class="form-col center">Krytyczny</th>
				<th class="form-col center">Wyświetlacz</th>
				<th class="form-col">Pon.</th>
				<th class="form-col">Wt.</th>
				<th class="form-col">Śr.</th>
				<th class="form-col">Czw.</th>
				<th class="form-col">Pt.</th>
				<th class="form-col">Sob.</th>
				<th class="form-col">Nd.</th>
				<th class="form-col center">Formuła</th>
				<th class="form-col center">{{ describeRelay(7) }}</th>
				<th class="form-col center">{{ describeRelay(6) }}</th>
				<th class="form-col center">{{ describeRelay(5) }}</th>
				<th class="form-col center">{{ describeRelay(4) }}</th>
				<th class="form-col center">{{ describeRelay(3) }}</th>
				<th class="form-col center">{{ describeRelay(2) }}</th>
				<th class="form-col center">{{ describeRelay(1) }}</th>
				<th class="form-col center">{{ describeRelay(0) }}</th>
				<th class="form-col center">
					<ButtonAdd @click="addEntry" title="Dodaj program czujnika" :disabled="termos.functions.length >= 15"/>
				</th>
			</tr>
		</thead>
		<tbody>
			<ProgramTimerWatchdog :termos="termos" />
			<ProgramSensor v-for="(func, index) in termos.functions" :key="index" :func="func" :mapping="mapping" :programs="termos.thermalPrograms" @delete="deleteEntry(index)" />
		</tbody>
	</table>
</div>
