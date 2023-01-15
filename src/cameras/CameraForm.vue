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

<table v-if="formVisible" class="full-width center">
	<tbody>
		<tr class="form-row">
			<td class="form-col">
				<label>1/&Delta;</label>
			</td>
			<td class="form-col">
				<input v-if="config" type="number" class="camera-form-input-number" v-model="config.min" min="1" max="100000" />
			</td>
			<td class="form-col">
				FPS: {{ fpsFormatted }}
			</td>
		</tr>
		<tr class="form-row" :class="md && md[0] && 'camera-md'">
			<td class="form-col">
				<label>&Delta;Y</label>
			</td>
			<td class="form-col">
				<input v-if="config" type="number" class="camera-form-input-number" v-model="config['min-Y']"  min="0" max="256" />
			</td>
			<td class="form-col">
				{{ diffs && diffs[0] }}
			</td>
		</tr>
		<tr class="form-row" :class="md && md[1] && 'camera-md'">
			<td class="form-col">
				<label>&Delta;U</label>
			</td>
			<td class="form-col">
				<input v-if="config" type="number" class="camera-form-input-number" v-model="config['min-U']" min="0" max="256" />
			</td>
			<td class="form-col">
				{{ diffs && diffs[1] }}
			</td>
		</tr>
		<tr class="form-row" :class="md && md[2] && 'camera-md'">
			<td class="form-col">
				<label>&Delta;V</label>
			</td>
			<td class="form-col">
				<input v-if="config" type="number" class="camera-form-input-number" v-model="config['min-V']" min="0" max="256" />
			</td>
			<td class="form-col">
				{{ diffs && diffs[2] }}
			</td>
		</tr>
		<tr>
			<td colspan="3">
				<button type="submit" @click.prevent="configure" disabled>
					<font-awesome-icon :icon="faSave" />
					Zapisz
				</button>
				<DeviceButton :place="place" :id="id" :name="name" :state="state" :want="want" :label="alias || name" :small="true" :switchable="switchable" />
				<button type="button" @click.prevent="formVisible = false" :disabled="working">
					<font-awesome-icon :icon="faTimes" />
					Anuluj
				</button>
			</td>
		</tr>
	</tbody>
</table>
<div v-else>
	<a @click.prevent="showForm" href="#">Ustawienia</a>
</div>
