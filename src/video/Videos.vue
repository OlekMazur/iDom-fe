<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2020, 2022, 2024 Aleksander Mazur

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
					<td class="form-col" v-if="placeSelection">
						<select v-model="place" @change="placeSelected">
							<option value="">Najnowsze z wielu miejsc</option>
							<option v-for="place in places" :key="place" :value="place">{{ placesThings[place] && placesThings[place].alias }}</option>
						</select>
					</td>
					<template v-if="!placeSelection || place">
						<td class="form-col" title="Numer najnowszego istniejącego nagrania">
							<span v-if="!isNaN(recMax)">{{ recMax }}</span>
							<font-awesome-icon v-else :icon="faSpinner" pulse fixed-width />
						</td>
						<td class="form-col">
							<button type="button" @click="setStartFrom(recMax)" :disabled="startFrom >= recMax" title="Pokaż najnowsze nagrania">
								<font-awesome-icon :icon="iconNewest" fixed-width />
							</button>
						</td>
						<td class="form-col">
							<button type="button" @click="setStartFrom(startFrom + showAtOnce)" :disabled="startFrom >= recMax" title="Pokaż nowsze nagrania">
								<font-awesome-icon :icon="iconNewer" fixed-width />
							</button>
						</td>
						<td class="form-col" title="Numer najnowszego pokazanego niżej nagrania">
							<EditNumber :value="startFrom" :min="minStartFrom" :max="recMax" @input="setStartFrom($event)" />
						</td>
						<td class="form-col">
							<button type="button" @click="setStartFrom(startFrom - showAtOnce)" :disabled="startFrom <= minStartFrom" title="Pokaż starsze nagrania">
								<font-awesome-icon :icon="iconOlder" fixed-width />
							</button>
						</td>
						<td class="form-col">
							<button type="button" @click="setStartFrom(recMin)" :disabled="startFrom <= minStartFrom" title="Pokaż najstarsze nagrania">
								<font-awesome-icon :icon="iconOldest" fixed-width />
							</button>
						</td>
						<td class="form-col" title="Numer najstarszego istniejącego nagrania">
							<span v-if="!isNaN(recMin)">{{ recMin }}</span>
							<font-awesome-icon v-else :icon="faSpinner" pulse fixed-width />
						</td>
					</template>
					<td class="form-col" v-else v-for="place in places">
						<ToggleSwitch :key="place" :state="!allPlacesExcluded[place]" @switch="excludePlace(place, !$event)" />
						{{ placesThings[place] && placesThings[place].alias }}
					</td>
					<td class="form-col" title="Liczba nagrań widocznych naraz">
						<EditNumber v-model="showAtOnce" min="1" max="100" />
					</td>
					<td class="form-col">
						<button type="button" @click="allPlay = !allPlay" :title="allPlay ? 'Nie odtwarzaj wszystkich' : 'Odtwarzaj wszystkie'">
							<font-awesome-icon :icon="allPlay ? faPlay : faPause" fixed-width />
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<transition name="basic" mode="out-in">
		<VideosAtOnePlace v-if="!placeSelection || place"
			:place="place"
			:things="things"
			:allPlay="allPlay"
			:showAtOnce="showAtOnce"
			:startFrom="startFrom"
			:recMin="recMin"
			:updateTS="updateTS"
		/>
		<VideosAtAllPlaces v-else
			:placesThings="placesThings"
			:places="selectedPlaces"
			:allPlay="allPlay"
			:showAtOnce="showAtOnce"
		/>
	</transition>
</div>
