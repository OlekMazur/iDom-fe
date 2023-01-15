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

<div class="center">
	<div class="menu">
		<table class="center">
			<tbody>
				<tr class="form-row">
					<td class="form-col" v-if="placeSelection">
						<select :value="place" @change.prevent="selectPlace($event.target.value)" required>
							<option v-if="places.indexOf('') < 0" value="" disabled>Miejsce</option>
							<option v-for="place in places" :key="place" :value="place">{{ place }}</option>
						</select>
					</td>
					<td class="form-col" v-if="unsynchronized">
						<span v-if="getWakeUp(place)" title="Obudź" class="button" @click="wakeup(place)">
							<font-awesome-icon :icon="faBell" fixed-width />
						</span>
						<span v-else class="big" title="Oczekiwanie na aktualizację, proszę czekać">
							<font-awesome-icon :icon="iconWarning" class="blink" />
						</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<transition name="basic" mode="out-in">
		<div v-if="loading" :key="place">
			<h1>
				<font-awesome-icon :icon="faSpinner" pulse fixed-width />
			</h1>
			<p>{{ error }}</p>
		</div>
		<div v-else-if="place !== undefined" :key="place">
			<Functions :termos="termos" :mapping="mapping" />
			<Formulas :formulas="termos.formulas" :mapping="mapping" />
			<div v-for="program in thermalPrograms" :key="program">
				<h1>
					Program dobowy temperaturowy {{ program }}
					<ButtonDelete @click="deleteThermalProgram(program)" title="Usuń program dobowy temperaturowy" />
				</h1>
				<DailyThermal :program="termos.thermalPrograms[program]" :step="TEMP_STEP" />
			</div>
			<div>
				<button type="button" @click="$set(termos.thermalPrograms, nextProgram(), [])" :disabled="saving">
					<font-awesome-icon :icon="faPlus" />
					Dodaj nowy program dobowy temperaturowy
				</button>
			</div>
			<div v-for="program in timerPrograms" :key="program">
				<h1>
					Program dobowy czasowy {{ program }}
					<ButtonDelete @click="deleteTimerProgram(program)" title="Usuń program dobowy czasowy" />
				</h1>
				<DailyTimer :program="termos.timerPrograms[program]" :mapping="mapping" />
			</div>
			<div>
				<button type="button" @click="$set(termos.timerPrograms, nextProgram(), [])" :disabled="saving">
					<font-awesome-icon :icon="faPlus" />
					Dodaj nowy program dobowy czasowy
				</button>
			</div>
		</div>
	</transition>
	<form v-if="place !== undefined">
		<button type="submit" class="form-col" @click.prevent="submit" :disabled="disabled || forbidden">
			<font-awesome-icon :icon="faMagic" />
			Zastosuj
		</button>
		<a class="button button-off form-col" :download="downloadFileName" @click="disabled || download($event.target)" :class="disabled ? 'disabled' : ''">
			<font-awesome-icon :icon="faFileExport" />
			Eksportuj
		</a>
		<button type="button" class="button-on form-col" @click.prevent="importTermosButton" :disabled="disabled">
			<font-awesome-icon :icon="faFileImport" />
			Importuj
		</button>
		<input ref="termosImportFile" type="file" hidden accept=".bin" @change="importTermosClick($event.target)" />
		<button type="reset" class="button-delete form-col" @click.prevent="load" :disabled="disabled">
			<font-awesome-icon :icon="faTimes" />
			Kasuj zmiany i pobierz obecne nastawy
		</button>
		<button type="reset" class="button-delete form-col" @click.prevent="clear" :disabled="saving">
			<font-awesome-icon :icon="faTimes" />
			Zacznij od zera
		</button>
	</form>
</div>
