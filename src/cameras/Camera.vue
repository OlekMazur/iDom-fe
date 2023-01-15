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

<div class="video">
	<div class="video-row">
		<SensorDeviceForm :place="place" :showPlace="true" type="devices" :id="id" :thing="data" :permissions="permissions">
			<button :title="wantPlay ? 'Zatrzymaj' : 'Puść'" :disabled="wantPlay != isPlaying" @click.prevent="wantPlay = !wantPlay">
				<div><font-awesome-icon :icon="wantPlay != isPlaying ? faSpinner : wantPlay ? faStop : faPlay" :pulse="wantPlay != isPlaying" fixed-width /></div>
			</button>
			<button :title="boost ? 'Oryginalny obraz' : 'Popraw widoczność'" @click.prevent="boost = !boost">
				<div><font-awesome-icon :icon="boost ? faEyeSlash : faEye" fixed-width /></div>
			</button>
		</SensorDeviceForm>
	</div>
	<div class="video-row-img center">
		<canvas v-show="framePrev" class="video" ref="canvas">
			Twoja przeglądarka nie dostarcza płótna
		</canvas>
	</div>
	<div class="video-row-img center">
		<canvas v-show="framesReady" class="video pixelated" ref="canvas2" />
	</div>
	<div class="video-row center">
		<CameraForm :place="place" :id="id" :name="data.name" :alias="data.alias"
			:state="data.state" :want="data.want" :switchable="switchable"
			:config="config" :diff="diff" :fps="fps"
		/>
	</div>
</div>
