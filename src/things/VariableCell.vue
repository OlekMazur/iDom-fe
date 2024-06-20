<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2022 Aleksander Mazur

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

<td class="center">
	<div v-if="thing" class="center" :class="style">
		<USB v-if="thing.key === 'sys.usb'" :info="thing.value" />
		<BTS v-else-if="thing.key === 'modem.ci'" :info="thing.value" />
		<SMART v-else-if="family === 'smart'" :info="thing.value" />
		<Sync v-else-if="family === 'sync'" :place="place" :name="thing.key" :info="thing.value" />
		<span v-else>{{ value }}</span>
		<ButtonDelete v-if="deletable" @click="deleteThing" title="Skasuj wartość" />
	</div>
	<Timestamp v-if="thing" :ts="thing.ts" :baseTS="ts" :timeout="timeout" />
</td>
