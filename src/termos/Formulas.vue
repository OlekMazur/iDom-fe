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

<div>
	<h1>Formuły sterowania pośredniego</h1>
	<table class="striped highlight">
		<thead>
			<tr class="form-row">
				<th class="form-col center" colspan="8">Iloczyn logiczny z formuł</th>
				<th class="form-col center" rowspan="2"></th>
				<th class="form-col center" colspan="8">Sterowane formuły</th>
				<th class="form-col center" rowspan="2"></th>
				<th class="form-col center" colspan="8">Sterowane urządzenia</th>
				<th class="form-col center" rowspan="2">
					<ButtonAdd @click="addEntry" title="Dodaj formułę sterowania pośredniego" :disabled="formulas.length >= 15" />
				</th>
			</tr>
			<tr class="form-row">
				<th class="form-col center">7</th>
				<th class="form-col center">6</th>
				<th class="form-col center">5</th>
				<th class="form-col center">4</th>
				<th class="form-col center">3</th>
				<th class="form-col center">2</th>
				<th class="form-col center">1</th>
				<th class="form-col center">0</th>
				<th class="form-col center">7</th>
				<th class="form-col center">6</th>
				<th class="form-col center">5</th>
				<th class="form-col center">4</th>
				<th class="form-col center">3</th>
				<th class="form-col center">2</th>
				<th class="form-col center">1</th>
				<th class="form-col center">0</th>
				<th class="form-col center">{{ describeRelay(7) }}</th>
				<th class="form-col center">{{ describeRelay(6) }}</th>
				<th class="form-col center">{{ describeRelay(5) }}</th>
				<th class="form-col center">{{ describeRelay(4) }}</th>
				<th class="form-col center">{{ describeRelay(3) }}</th>
				<th class="form-col center">{{ describeRelay(2) }}</th>
				<th class="form-col center">{{ describeRelay(1) }}</th>
				<th class="form-col center">{{ describeRelay(0) }}</th>
			</tr>
		</thead>
		<tbody>
			<Formula v-for="(formula, index) in formulas" :key="index" :formula="formula" @delete="deleteEntry(index)" />
		</tbody>
	</table>
</div>
