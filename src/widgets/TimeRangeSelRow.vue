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

<tr class="form-row">
	<slot />
	<td class="form-col" v-if="rangeX">
		<button type="button" @click.prevent="posXMove(false)" :disabled="!posXEndFormatValid">
			<font-awesome-icon :icon="waiting ? faSpinner : faAngleDoubleLeft" :pulse="waiting" fixed-width />
		</button>
	</td>
	<td class="form-col">
		<template v-if="!posXEndInit">
			<input v-model="posXEndAuto" type="checkbox" id="posXEndAuto" />
			<label for="posXEndAuto"> Teraz</label>
		</template>
		<span v-if="posXEndAuto">
			{{ posXEndFormatted }}
		</span>
		<input v-else-if="editing" v-model="posXEndFormattedNew" ref="input"
			type="datetime-local" step="60" :style="{ width: width + 'px' }"
			required :class="posXEndFormatValid ? '' : 'invalid'"
			@focus="focused = true" @blur="focused && commit()"
			@keydown.enter="commit" @keydown.esc="rollback"
		/>
		<a href="#" v-else @click.prevent="begin" ref="view">
			{{ posXEndFormatted }}
		</a>
	</td>
	<td class="form-col" v-if="rangeX">
		<button type="button" @click.prevent="posXMove(true)" :disabled="!posXEndFormatValid">
			<font-awesome-icon :icon="waiting ? faSpinner : faAngleDoubleRight" :pulse="waiting" fixed-width />
		</button>
	</td>
</tr>
