<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2020 Aleksander Mazur

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
		<span class="video-left">{{ ts }}</span>
		<span class="video-right" v-if="cam">{{ cam }}</span>
	</div>
	<div class="video-row-img center big">
		<img v-show="false" v-if="imgURL" :src="imgURL" crossorigin="anonymous" class="video" @load="imgLoaded" @error="imgFailed" @click="playPause" ref="img" />
		<canvas v-show="imgReady" class="video" @click="playPause" ref="canvas">
			Twoja przeglądarka nie dostarcza płótna
		</canvas>
		<font-awesome-icon v-if="!video.ext" :icon="faSpinner" pulse fixed-width title="Proszę czekać..." />
	</div>
	<div class="video-row">
		<span class="video-left big">
			<span v-if="video.order" title="Zamówiony">{{ video.no }}.{{ video.ext }}</span>
			<a v-else-if="url || (permissions && permissions.order)" :href="url" :download="ts + '.' + this.video.ext" @click="clickURL">{{ video.no }}.{{ video.ext }}</a>
			<span v-else title="Niedostępny">{{ video.no }}.{{ video.ext }}</span>
			<span class="video-player" v-if="video.ext">
				<span v-if="video.order" title="Anuluj zamówienie" class="button" @click="cancelOrder">
					<font-awesome-icon :icon="faEnvelope" fixed-width />
				</span>
				<span :title="play ? 'Zatrzymaj' : 'Odtwarzaj'" class="button" @click="playPause">
					<font-awesome-icon :icon="play ? faPlay : faPause" fixed-width />
				</span>
				<EditNumber v-if="frame !== undefined" v-model="frame" :min="0" :max="video.hasTN" title="Numer widocznej lub pobieranej klatki" />
				<template v-if="video.hasTN !== undefined"> / {{ video.hasTN }}</template>
				<span v-if="video.wantTN" title="Anuluj pobieranie następnych klatek" class="button" @click="setWantTN(false)">
					<font-awesome-icon :icon="faHandPaper" fixed-width />
				</span>
				<span v-else-if="permissions && permissions.tn" title="Pobierz następne klatki" class="button" @click="setWantTN(true)">
					<font-awesome-icon :icon="faPlus" fixed-width />
				</span>
			</span>
		</span>
		<span class="video-right big">{{ size }}</span>
	</div>
</div>
