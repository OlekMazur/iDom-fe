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

<tr v-if="data.name !== 'lo'">
	<td class="center">
		<div v-if="data.name" class="big" :title="data.name">
			<font-awesome-icon v-if="icon" :icon="icon" />
			<template v-else>{{ data.name }}</template>
		</div>
		<div v-if="data.address">{{ data.address }}</div>
	</td>
	<td><ThroughputIcon :icon="iconDown" :data="{ bytes: data.rxBytes, packets: data.rxPackets }" /></td>
	<td class="min-width">
		<Throughput v-if="data.rxBytes && uptime" :data="{ bytes: data.rxBytes, uptime: uptime }" />
	</td>
	<td><ThroughputIcon :icon="iconUp" :data="{ bytes: data.txBytes, packets: data.txPackets }" /></td>
	<td class="min-width">
		<Throughput v-if="data.txBytes && uptime" :data="{ bytes: data.txBytes, uptime: uptime }" />
	</td>
</tr>
