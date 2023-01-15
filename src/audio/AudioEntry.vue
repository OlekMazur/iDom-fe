<!--
This file is part of iDom-fe.

Copyright (c) 2019, 2020, 2021, 2022 Aleksander Mazur

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
		<table class="center striped">
			<tbody>
				<tr class="form-row" v-if="error">
					<td class="form-col bold center" colspan="4">
						{{ error }}
					</td>
				</tr>
				<tr class="form-row">
					<td class="form-col">
						<label for="clients">Głośniki</label>
					</td>
					<td class="form-col">
						<span v-if="loopback">{{ audioLabels[loopback] || loopback }}</span>
						<select v-else required v-model="playback" :disabled="audioList.length <= 1">
							<option v-for="playback in audioList" :key="playback" :value="playback">{{ audioLabels[playback] }}</option>
						</select>
					</td>
					<td class="form-col" colspan="2">
						<button v-if="loopback" type="button" @click="audioCtl('stop')" :disabled="working" title="Cisza">
							<font-awesome-icon :icon="faVolumeMute" fixed-width />
						</button>
						<button v-else type="button" @click="audioCtl('play', playback)" :disabled="working || !playback" title="Graj">
							<font-awesome-icon :icon="faVolumeUp" fixed-width />
						</button>
					</td>
				</tr>
				<tr class="form-row" v-if="!isNaN(clients)">
					<td class="form-col">
						<label for="clients">Liczba słuchaczy</label>
					</td>
					<td class="form-col right min-width">
						<span id="clients">{{ clients }}</span>
					</td>
					<td class="form-col">
					</td>
					<td class="form-col">
					</td>
				</tr>
				<tr class="form-row" v-if="!isNaN(signal)">
					<td class="form-col">
						<label for="signal">Poziom sygnału</label>
					</td>
					<td class="form-col right min-width">
						<span id="signal">{{ signal }}</span>
					</td>
					<td class="form-col">
						%
					</td>
					<td class="form-col">
					</td>
				</tr>
				<tr class="form-row" v-if="!isNaN(afc)">
					<td class="form-col">
						<label for="afc">ARCz</label>
					</td>
					<td class="form-col right min-width">
						<span id="afc">{{ afc }}</span>
					</td>
					<td class="form-col">
						kHz
					</td>
					<td class="form-col">
					</td>
				</tr>
				<tr class="form-row" v-if="!isNaN(frequency)">
					<td class="form-col">
						<button type="button" @click="setFrequency(Math.round(frequency * 10 - 1) / 10)" :disabled="working" title="Zmniejsz">
							<font-awesome-icon :icon="faArrowLeft" />
						</button>
						<label for="freq">Częstotliwość</label>
						<button type="button" @click="setFrequency(Math.round(frequency * 10 + 1) / 10)" :disabled="working" title="Zwiększ">
							<font-awesome-icon :icon="faArrowRight" />
						</button>
					</td>
					<td class="form-col right min-width big bold">
						<EditNumber id="freq" :value="frequency" @input="setFrequency($event)"
							:min="freqMin" :max="freqMax" step="0.05"
							required :disabled="working" title="Zmień"
						/>
					</td>
					<td class="form-col">
						MHz
					</td>
					<td class="form-col">
						<ButtonAdd @click="addChannel" title="Dodaj do listy" :disabled="channels.indexOf(frequency) >= 0" />
					</td>
				</tr>
				<tr class="form-row" v-if="errorTune">
					<td class="form-col bold center" colspan="4">
						{{ errorTune }}
					</td>
				</tr>
				<tr class="form-row" v-if="typeof caps.tuner === 'object'" v-for="(frequency, index) in channels">
					<td class="form-col">
						<EditString type="text" :value="channelNames[frequency] || '#' + (index + 1)" @input="setChannelName(frequency, $event)" />
					</td>
					<td class="form-col right min-width">
						<button type="button" class="radio" @click="setFrequency(frequency)" :disabled="working" title="Strój">
							{{ frequency }}
						</button>
					</td>
					<td class="form-col">
						MHz
					</td>
					<td class="form-col">
						<ButtonDelete @click="delChannel(frequency, index)" title="Usuń z listy" />
					</td>
				</tr>
				<tr class="form-row" v-if="typeof caps.tuner === 'object'">
					<td class="form-col center" colspan="4">
						<a class="button button-off" download="radio.json" @click="exportRadiosClick($event.target)">
							<font-awesome-icon :icon="faFileExport" />
							Eksportuj
						</a>
						<button type="button" class="button-on" @click.prevent="importRadiosButton">
							<font-awesome-icon :icon="faFileImport" />
							Importuj
						</button>
						<input ref="radiosImportFile" type="file" hidden accept=".json" @change="importRadiosClick($event.target)" />
					</td>
				</tr>
				<tr class="form-row" v-if="!isNaN(softvol_b)">
					<td class="form-col">
						Składowa stała
					</td>
					<td class="form-col min-width">
						<EditNumber id="softvol_b" :value="softvol_b" @input="setSoftVolB($event)"
							:min="-16777216" :max="16777216"
							required :disabled="working" title="Zmień"
						/>
					</td>
					<td class="form-col">
					</td>
					<td class="form-col">
					</td>
				</tr>
				<tr class="form-row" v-if="!isNaN(softvol_a256)">
					<td class="form-col">
						Mnożnik amplitudy
					</td>
					<td class="form-col min-width">
						<EditNumber :value="softvol_a256" @input="setSoftVolA256($event)"
							:min="-16777216" :max="16777216"
							required :disabled="working" title="Zmień"
						/>
					</td>
					<td class="form-col">
						/ 256
					</td>
					<td class="form-col">
					</td>
				</tr>
				<tr class="form-row" v-if="!isNaN(fakerate)">
					<td class="form-col">
						<label for="fakerate">Częstotliwość próbkowania</label>
					</td>
					<td class="form-col min-right width">
						<EditNumber id="fakerate" :value="fakerate || 32000" @input="audioCtl('rate', $event)"
							:min="8000" :max="48000" step="50"
							required :disabled="working" title="Zmień"
						/>
					</td>
					<td class="form-col">
						Hz
					</td>
					<td class="form-col">
						<ButtonDelete v-if="fakerate" @click="audioCtl('rate', 0)" title="Przywróć oryginalną (bez korekty)" />
					</td>
				</tr>
				<tr class="form-row">
					<td class="form-col center" colspan="4">
						<audio v-if="audioURL" autoplay controls :key="'audio-' + audio" ref="audio" @playing="recovered" @stalled="recover" @ended="recover">
							<source :src="audioURL" type="audio/wav">
							<p>Twoja przeglądarka nie obsługuje odtwarzania dźwięku w formacie WAV.</p>
							<p class="bold">Puść sobie sam: <a :href="audioURL">audio.wav</a></p>
						</audio>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
