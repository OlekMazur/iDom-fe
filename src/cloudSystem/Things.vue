<!--
This file is part of iDom-fe.

Copyright (c) 2020, 2024 Aleksander Mazur

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
				<TimeRangeSelRow storagePrefix="cleanup" :rangeX="rangeX" :posXEndInit="posXEndInit" @input="posXEnd = $event">
					<td class="form-col">
						<button type="reset" class="button-delete" @click.prevent="cleanup" :disabled="working">
							<font-awesome-icon :icon="working ? faSpinner : faTimes" :pulse="working" fixed-width />
							Kasuj historię sprzed
						</button>
					</td>
				</TimeRangeSelRow>
			</tbody>
		</table>
	</div>
	<table class="striped highlight">
		<thead>
			<tr>
				<th class="center vcenter">
					<font-awesome-icon :icon="faQuestion" fixed-width />
				</th>
				<th class="vcenter">Nazwa</th>
				<th class="center vcenter" v-for="place in places" :key="place">
					{{ placesThings[place] && placesThings[place].alias }}
				</th>
			</tr>
		</thead>
		<tbody>
			<!--
			<tr v-for="group in devices" :key="group.name">
				<td class="center vcenter" title="Urządzenie">
					<font-awesome-icon :icon="group.icon" fixed-width />
				</td>
				<td class="vcenter">{{ group.name }}</td>
				<ThingInfo v-for="place in places" v-if="group.idAt.hasOwnProperty(place)" :key="place"
					:place="place" type="devices" :id="group.idAt[place]"
					:posXEnd="posXEnd"
					:working="working && !(partiallyDone && partiallyDone['devices.' + place + '.' + group.idAt[place]])"
				/>
				<td v-else />
			</tr>
			-->
			<tr v-for="group in sensors" :key="group.name">
				<td class="center vcenter" title="Czujnik">
					<font-awesome-icon :icon="group.icon" fixed-width />
				</td>
				<td class="vcenter">{{ group.name }}</td>
				<ThingInfo v-for="place in places" v-if="group.idAt.hasOwnProperty(place)" :key="place"
					:place="place" type="sensors" :id="group.idAt[place]"
					:posXEnd="posXEnd"
					:working="working && !(partiallyDone && partiallyDone['sensors.' + place + '.' + group.idAt[place]])"
				/>
				<td v-else />
			</tr>
			<!--
			<tr v-for="group in neighbours" :key="group.name">
				<td class="center vcenter" title="Urządzenie">
					<font-awesome-icon :icon="group.icon" fixed-width />
				</td>
				<td class="vcenter">{{ group.name }}</td>
				<ThingInfo v-for="place in places" v-if="group.idAt.hasOwnProperty(place)" :key="place"
					:place="place" type="neighbours" :id="group.idAt[place]"
					:posXEnd="posXEnd"
					:working="working && !(partiallyDone && partiallyDone['neighbours.' + place + '.' + group.idAt[place]])"
				/>
				<td v-else />
			</tr>
			-->
		</tbody>
	</table>
</div>
