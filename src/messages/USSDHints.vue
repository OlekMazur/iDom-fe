<!--
This file is part of iDom-fe.

Copyright (c) 2019, 2022 Aleksander Mazur

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

<div class="center">
	<a v-if="hints.operator" :href="hints.href" class="center" target="_blank">
		<img v-if="hints.logo" class="ussd-hints-logo" :src="hints.logo" :alt="hints.operator" :title="hints.operator" />
		<span v-else>{{ hints.operator }}</span>
	</a>
	<table v-if="hints.codes && hints.codes.length" class="center striped highlight">
		<thead>
			<tr class="form-row">
				<th class="form-col">Kod USSD</th>
				<th class="form-col">Opis</th>
				<th class="form-col">Cena</th>
			</tr>
		</thead>
		<tbody>
			<tr class="form-row" v-for="ussd in hints.codes">
				<td class="form-col bold">{{ ussd.code }}</td>
				<td class="form-col">{{ ussd.desc }}</td>
				<td class="form-col">{{ ussd.price || '' }}</td>
			</tr>
		</tbody>
	</table>
</div>
