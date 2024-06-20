<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2021, 2024 Aleksander Mazur

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

<form v-if="formVisible">
	<div class="form-row full-width">
		<div class="form-col full-width">
			<label>Identyfikator</label>
		</div>
		<div class="form-col full-width">
			<input type="text" name="name" readonly :value="thing.name" />
		</div>
	</div>
	<div class="form-row full-width">
		<div class="form-col full-width">
			<label>Funkcja</label>
		</div>
		<div class="form-col full-width">
			<input type="text" name="alias" v-model="newAlias" ref="focus" />
		</div>
	</div>
	<div class="form-row full-width">
		<button type="submit" @click.prevent="renameThing" :disabled="working || (permissions && !permissions.rename)">
			<font-awesome-icon :icon="iconSave" />
			Zmień nazwę
		</button>
		<button v-if="!thing.alias" type="button" class="button-delete" @click.prevent="deleteThing" :disabled="working || (permissions && !permissions.remove)">
			<font-awesome-icon :icon="iconDelete" />
			Usuń
		</button>
		<button type="button" @click.prevent="formVisible = false">
			<font-awesome-icon :icon="iconCancel" />
			Anuluj
		</button>
		<span v-if="showPlace && alias"> @{{ alias }}</span>
	</div>
</form>
<div v-else>
	<div>
		<slot/>
		<a @click.prevent="showForm" href="#">{{ thing.alias || thing.name }}</a>
		<span v-if="showPlace && alias"> @{{ alias }}</span>
	</div>
</div>
