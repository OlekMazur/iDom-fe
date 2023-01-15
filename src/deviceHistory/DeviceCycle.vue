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

<tr>
	<td class="right">{{ index }}</td>
	<td class="min-width">{{ formatTS(entry.ts) }}</td>
	<td class="min-width">
		<template v-if="entry.on !== undefined">
			{{ formatElapsedTime(entry.on) }}
			<ButtonDelete v-if="entry.on < deletableShorterThan" @click="$emit('deleteOnTime')"
				title="Usuń błędnie zgłoszony (w rzeczywistości nie mający miejsca) okres działania"
			/>
		</template>
	</td>
	<td class="min-width center bold">{{ entry.on !== undefined && entry.total !== undefined ? formatNumberWithUnit(100 * entry.on / entry.total, '%') : '' }}</td>
	<td class="min-width">
		<template v-if="entry.off !== undefined">
			{{ formatElapsedTime(entry.off) }}
			<ButtonDelete v-if="entry.off < deletableShorterThan" @click="$emit('deleteOffTime')"
				title="Usuń błędnie zgłoszoną (w rzeczywistości nie mającą miejsca) przerwę w działaniu"
			/>
		</template>
	</td>
	<td class="min-width center">{{ entry.off !== undefined && entry.total !== undefined ? formatNumberWithUnit(100 * entry.off / entry.total, '%') : '' }}</td>
	<td class="min-width">{{ entry.total !== undefined ? formatElapsedTime(entry.total) : '' }}</td>
</tr>
