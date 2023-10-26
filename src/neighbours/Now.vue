<!--
This file is part of iDom-fe.

Copyright (c) 2019 Aleksander Mazur

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
	<div class="menu">
		<table class="center">
			<tbody>
				<tr class="form-row">
					<td class="form-col">
						<label for="showAtOnce">Limit widocznych naraz</label>
						<OptionalNumber v-model="showAtOnce" id="showAtOnce"
							:minValue="1" :maxValue="1000" :defaultValue="10"
							labelDel="Pokaż wszystko bez ograniczeń"
							labelAdd="Ogranicz liczbę widocznych urządzeń"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<table class="striped highlight">
		<tbody>
			<NeighbourDevice v-for="nd in neighbours" :key="nd.place + '.' + nd.id" :nd="nd" />
		</tbody>
	</table>
</div>
