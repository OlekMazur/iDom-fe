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
	<div v-if="audioList.length >= 1" class="menu">
		<table class="center">
			<tbody>
				<tr class="form-row">
					<td class="form-col">
						Źródło dźwięku
					</td>
					<td class="form-col">
						<select v-model="audio" required :disabled="audioList.length <= 1">
							<option v-for="audio in audioList" :key="audio" :value="audio">{{ audioLabels[audio] }}</option>
						</select>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<h1 v-else-if="audios" class="center">
		Brak źródeł dźwięku
	</h1>
	<transition name="basic" mode="out-in">
		<AudioEntry v-if="audio" :audio="audio" :caps="audios.record[audio]" :playbackDevices="audios.playback" />
	</transition>
</div>
