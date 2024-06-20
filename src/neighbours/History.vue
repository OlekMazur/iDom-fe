<!--
This file is part of iDom-fe.

Copyright (c) 2019, 2022, 2024 Aleksander Mazur

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
					<td class="form-col" v-for="place in places">
						<ToggleSwitch :key="place" :state="!allPlacesExcluded[place]" @switch="excludePlace(place, !$event)" />
						{{ placesThings[place] && placesThings[place].alias }}
					</td>
					<td class="form-col" v-for="(info, type) in typeIcons">
						<font-awesome-layers fixed-width @click.prevent="excludeType(type, !typesExcluded[type])" :title="info.title">
							<font-awesome-icon :icon="info.icon" size="lg" />
							<font-awesome-icon v-if="typesExcluded[type]" :icon="faBan" class="neighbour-excluded" transform="grow-20" />
						</font-awesome-layers>
					</td>
				</tr>
			</tbody>
		</table>
		<table class="center">
			<tbody>
				<tr class="form-row">
					<td class="form-col">
						<label for="showAtOnce">Limit urządzeń</label>
						<br/>
						<OptionalNumber v-model="showAtOnce" id="showAtOnce"
							:minValue="1" :maxValue="1000" :defaultValue="10"
							labelDel="Pokaż wszystko bez ograniczeń"
							labelAdd="Ogranicz liczbę widocznych urządzeń"
						/>
					</td>
					<td class="form-col">
						<label for="historyAtOnce">Limit wpisów historii</label>
						<br/>
						<EditNumber v-model="historyAtOnce" id="historyAtOnce"
							:min="1" :max="1000"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<table>
		<tbody>
			<template v-for="nd in neighbours">
				<tr>
					<td colspan="3">
						<hr />
					</td>
				</tr>
				<NeighbourDevice :key="nd.place + '.' + nd.id" :nd="nd">
					<td>
						<CollapseExpand
							:state="history[nd.place + '.' + nd.id]"
							@switch="handleCollapseExpand(nd, $event)"
						/>
					</td>
				</NeighbourDevice>
				<NeighbourHistory v-if="history[nd.place + '.' + nd.id]"
					:placesThings="placesThings"
					:key="nd.place + '.' + nd.id + '-history'" :nd="nd"
					:cntMax="historyAtOnce"
				/>
			</template>
		</tbody>
	</table>
</div>
