/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2021, 2022 Aleksander Mazur
 *
 * iDom-fe is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * iDom-fe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with iDom-fe. If not, see <https://www.gnu.org/licenses/>.
 */

import template from './System.vue.js'
import Vue from 'vue'
import { faShuffle } from '@fortawesome/free-solid-svg-icons/faShuffle'
import { faRepeat } from '@fortawesome/free-solid-svg-icons/faRepeat'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons/faCloudUploadAlt'
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave'
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload'
import { faBoltLightning } from '@fortawesome/free-solid-svg-icons/faBoltLightning'
import { ISystemInfo } from '../data/System'
import { QueryPost, QueryPostForm, ExpectResponseEmpty } from '../data/Client'
import { ErrorMessage } from '../data/API'
import Parameters from './Parameters'
import Processor from './Processor'
import Services from './Services'
import Media from './Media'
import Network from './Network'
import Lease from './Lease'
import Printers from './Printers'
import SystemOp, { IOperationData } from './SystemOp'

const SystemOperations: IOperationData[] = [
	{
		op: 'kill-internet',
		icon: faShuffle,
		clazz: 'button-delete',
		label: 'Restartuj połączenie internetowe',
		question: 'Czy na pewno chcesz ubić internet?',
		//success: 'Internet ubity; obserwuj odradzanie się połączenia.',
		failure: 'Nie udało się ubić internetu',
	},
	{
		op: 'reset-modem',
		icon: faBoltLightning,
		clazz: 'button-delete',
		label: 'Resetuj modem',
		question: 'Czy na pewno chcesz zresetować modem, co jest równoznaczne z nagłym odłączeniem włożonej weń karty pamięci, na której być może właśnie trwa zapis?',
		failure: 'Nie udało się zresetować modemu',
	},
	{
		op: 'reboot',
		icon: faRepeat,
		clazz: 'button-delete',
		label: 'Restartuj system',
		question: 'Czy na pewno chcesz zrestartować system?',
		//success: 'System rozpoczął restart. Może to zająć minutę albo dwie.',
		failure: 'Nie udało się zrestartować systemu',
	},
	{
		op: 'force-uplink',
		icon: faCloudUploadAlt,
		label: 'Gadaj z chmurą',
		question: 'Czy na pewno chcesz wymusić połączenie z serwerem chmury?',
		//success: 'System rozpoczyna komunikację z serwerem chmury. Serwer powinien niebawem odnotować połączenie.',
		failure: 'Nie udało się wymusić połączenia z serwerem chmury',
	},
	{
		op: 'force-backup',
		icon: faSave,
		label: 'Zapisz bazę danych',
		question: 'Czy na pewno chcesz wymusić zapisanie bazy danych na lokalnym nośniku?\n'
			+ '(Może to spowodować rozkręcenie twardego dysku.)',
		//success: 'System rozpoczyna zapis na dysku. Baza danych powinna zostać niebawem zapisana.',
		failure: 'Nie udało się zapisać bazy danych na dysku',
	},
]

const UpgradeOperations: IOperationData[] = [
	{
		op: 'reboot',
		args: {
			to: 'upgrade',
		},
		icon: faRepeat,
		clazz: 'button-delete',
		label: 'Restartuj do nowej wersji',
		question: 'Czy na pewno chcesz zrestartować system i uruchomić nową wersję na próbę?',
		failure: 'Nie udało się zrestartować systemu',
	},
	{
		op: 'finish-upgrade',
		icon: faSave,
		label: 'Zatwierdź nową wersję na stałe',
		question: 'Czy na pewno chcesz zatwierdzić nową wersję do uruchamiania domyślnie?',
		failure: 'Nie udało się zatwierdzić nowej wersji',
	},
]

export default Vue.extend({
	...template,
	components: { Processor, Parameters, Services, Media, Network, Lease, Printers, SystemOp },
	props: {
		system: Object as () => ISystemInfo,
	},
	data: function() {
		return {
			SystemOperations,
			UpgradeOperations,
			faUpload,
			working: false,
		}
	},
	methods: {
		perform: function(data: IOperationData) {
			if (data.question && !confirm(data.question))
				return

			this.working = true
			QueryPost('/cgi-bin/' + data.op, data.args)
			.then(ExpectResponseEmpty)
			//.then(() => this.$alert(data.success))
			.catch((e) => this.$alert(data.failure + '\n\n' + ErrorMessage(e)))
			.then(() => {
				this.working = false
			})
		},
		upgradeButton: function(): void {
			(this.$refs.upgradeFile as HTMLInputElement).click()
		},
		upgradeClick: function(elem: HTMLInputElement): void {
			if (!elem.files || !elem.files[0])
				return

			this.working = true
			QueryPostForm('/cgi-bin/upgrade', new FormData(this.$refs.upgradeForm as HTMLFormElement))
			.then(ExpectResponseEmpty)
			.catch((e) => this.$alert('Błąd wgrywania pliku z aktualizacją\n\n' + ErrorMessage(e)))
			.then(() => {
				this.working = false
			})
		},
	},
})
