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

<div v-if="waiting" class="big center">
	<font-awesome-icon :icon="faSpinner" pulse fixed-width />
</div>
<table v-else class="striped highlight">
	<thead>
		<tr v-if="syslogs.length">
			<th class="center">Nazwa</th>
			<th class="center">Rozmiar</th>
			<th class="center">Przyczyna</th>
			<th v-if="permissionToOrder" class="center" title="Zamówienie">
				<font-awesome-icon :icon="faEnvelope" fixed-width />
			</th>
		</tr>
		<tr v-else>
			<th colspan="4" class="center">
				Brak dzienników
			</th>
		</tr>
	</thead>
	<tbody>
		<Syslog
			v-for="syslog in syslogs"
			:key="syslog.name"
			:syslog="syslog"
			:permissionToOrder="permissionToOrder"
			:place="place"
		/>
	</tbody>
	<tfoot>
		<tr>
			<th colspan="2">{{ ts }}</th>
			<th class="right">
				<span v-if="refreshAvailable" title="Odśwież" class="button" @click="refresh()">
					<font-awesome-icon :icon="faSync" fixed-width />
				</span>
			</th>
			<th v-if="permissionToOrder">
				<span v-if="getWakeUp()" title="Obudź" class="button" @click="wakeup()">
					<font-awesome-icon :icon="faBell" fixed-width />
				</span>
			</th>
		</tr>
	</tfoot>
</table>
