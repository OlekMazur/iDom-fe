<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2021, 2022 Aleksander Mazur

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

<div class="center">
	<div v-if="system && system.interfaces">
		<h1>Interfejsy sieciowe</h1>
		<Network :data="system.interfaces" :uptime="system.uptime" />
	</div>
	<div v-if="system && system.leases && system.leases.length">
		<h1>Intranet</h1>
		<table class="highlight">
			<tbody>
				<Lease v-for="(lease, index) in system.leases" :key="index" :data="lease" :uptime="system.uptime" />
			</tbody>
		</table>
	</div>
	<div v-if="system && system.printers">
		<h1>Drukarki</h1>
		<Printers :data="system.printers" />
	</div>
	<div v-if="system && system.media">
		<h1>Nośniki danych</h1>
		<Media :data="system.media" :mount="system.mount" />
	</div>
	<div v-if="system && system.cpu && system.cpu.length">
		<h1>{{ system.cpu.length > 1 ? 'Procesory' : 'Procesor' }}</h1>
		<table class="highlight">
			<tbody>
				<Processor v-for="(cpu, index) in system.cpu" :key="index" :cpu="cpu" />
			</tbody>
		</table>
	</div>
	<div v-if="system">
		<h1>Parametry</h1>
		<Parameters :data="system" />
	</div>
	<div v-if="system && system.services">
		<h1>Usługi</h1>
		<Services :data="system.services" :uptime="system.uptime" />
	</div>
	<form v-if="system">
		<SystemOp v-for="(data, op) in SystemOperations" :key="op" :op="op" :data="data" :disabled="working" @perform="perform" />
	</form>
	<form v-if="system" ref="upgradeForm">
		<button type="button" class="button-on form-col" @click.prevent="upgradeButton" :disabled="working">
			<font-awesome-icon :icon="faUpload" />
			Aktualizuj oprogramowanie
		</button>
		<SystemOp v-for="(data, op) in UpgradeOperations" :key="op" :op="op" :data="data" :disabled="working" @perform="perform" />
		<input ref="upgradeFile" type="file" name="image" hidden accept=".img" @change="upgradeClick($event.target)" />
	</form>
</div>
