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

<tr>
	<td class="center"><font-awesome-icon :icon="icon" /></td>
	<td class="min-width">{{ data.modelName }}</td>
	<td class="min-width right">{{ totalSpace }}</td>
	<td class="min-width right">{{ availSpace }}</td>
	<td class="min-width">
		<template v-for="func in funcs">
			<font-awesome-icon v-if="func.icon" :icon="func.icon" :title="func.name" :key="func.name" />
			<span v-else :key="func.name">{{ func.name }}</span>
			{{ ' ' }}
		</template>
	</td>
</tr>
