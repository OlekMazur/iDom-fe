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
	<td class="min-width">{{ ts }}</td>
	<td class="min-width">
		<template v-if="elapsedOn !== undefined">
			{{ elapsedOn }}
			<ButtonDelete v-if="entry.on < deletableShorterThan" @click="$emit('deleteOnTime')"
				title="Usuń błędnie zgłoszony (w rzeczywistości nie mający miejsca) okres działania"
			/>
		</template>
	</td>
	<td class="min-width center bold">{{ percentOn }}</td>
	<td class="min-width">
		<template v-if="elapsedOff !== undefined">
			{{ elapsedOff }}
			<ButtonDelete v-if="entry.off < deletableShorterThan" @click="$emit('deleteOffTime')"
				title="Usuń błędnie zgłoszoną (w rzeczywistości nie mającą miejsca) przerwę w działaniu"
			/>
		</template>
	</td>
	<td class="min-width center">{{ percentOff }}</td>
	<td class="min-width">{{ elapsedTotal }}</td>
</tr>
