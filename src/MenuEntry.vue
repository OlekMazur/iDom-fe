<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2022, 2023 Aleksander Mazur

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

<nav class="menu">
	<table class="center menu">
		<tbody>
			<tr>
				<router-link tag="td" class="menu" v-for="item in items" v-if="item.meta" :key="item.path" :to="item.path" :title="item.meta.title">
					<font-awesome-icon :icon="item.meta.icon" size="lg" />
					<span class="menu-label"> {{ item.meta.label || item.meta.title }}</span>
				</router-link>
				<td class="menu nohover">
					<NotificationPermission :nh="nh" />
				</td>
				<td class="menu nohover">
					<Status :status="status" :title="message" @click="$emit('click')" />
				</td>
			</tr>
		</tbody>
	</table>
</nav>
