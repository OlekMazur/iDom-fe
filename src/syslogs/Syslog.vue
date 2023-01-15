<!--
This file is part of iDom-fe.

Copyright (c) 2021 Aleksander Mazur

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
	<td>
		<a v-if="url" :href="url" target="_blank">{{ syslog.name }}</a>
		<span v-else>{{ syslog.name }}</span>
	</td>
	<td class="right">{{ size }}</td>
	<td>{{ syslog.desc }}</td>
	<td v-if="permissionToOrder" class="center">
		<ToggleSwitch
			:state="syslog.order"
			:disabled="!permissionToOrder"
			@switch="order(syslog.name, $event)"
		/>
	</td>
</tr>
