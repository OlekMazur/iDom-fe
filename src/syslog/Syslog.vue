<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2021 Aleksander Mazur

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

<div>
	<div class="menu">
		<table class="center">
			<tbody>
				<tr class="form-row">
					<td class="form-col">
						<label :class="disabledIfWorking">Pokaż co najmniej</label>
					</td>
					<td class="form-col">
						<select v-model="level" :disabled="working" >
							<option v-for="(level, index) in levels" :key="index" :value="index">{{ level }}</option>
						</select>
					</td>
					<td class="form-col">
						<label :class="disabledIfWorking">Tylko z</label>
					</td>
					<td class="form-col">
						<select v-model="identity" :disabled="working" >
							<option v-for="(identity, index) in identities" :key="index" :value="identity">{{ identity || '(zewsząd)' }}</option>
						</select>
					</td>
					<td class="form-col">
						<button type="button" @click="update" :disabled="working" title="Odśwież">
							<font-awesome-icon :icon="refreshIcon" :pulse="working" />
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<table class="striped highlight">
		<thead>
			<tr>
				<th>Czas</th>
				<th class="center"><font-awesome-icon :icon="levelIcon" /></th>
				<th>Kto</th>
				<th>PID</th>
				<th>Komunikat</th>
			</tr>
		</thead>
		<tbody v-if="syslog.length">
			<SyslogEntry v-for="entry in syslog" v-if="!identity || identity === entry.identity" :key="entry.ts + '.' + entry.severity + '.' + entry.facility + '.' + entry.identity + '.' + entry.pid + '.' + entry.msg" :entry="entry" :bootTS="bootTS" :levels="levels" />
		</tbody>
	</table>
</div>
