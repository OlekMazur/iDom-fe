/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2022 Aleksander Mazur
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

import template from './VariableHeader.vue.js'
import Vue from 'vue'
import { SYNC_TERMOSTAT_BIN, VAR_SYNC_PREFIX } from '../data/Things'

const xlatVariableKey: { [key: string]: string } = {
	'modem.error': 'Komunikat błędu modemu',
	'modem.ci': 'Identyfikator komórki (sieci komórkowej)',
	'modem.imei': 'Numer IMEI modemu',
	'modem.lac': 'Kod obszaru lokalizacji (sieci komórkowej)',
	'modem.manufacturer': 'Producent modemu',
	'modem.model': 'Model modemu',
	'modem.plmn': 'Kod kraju i operatora (sieci komórkowej)',
	'modem.reg': 'Rejestracja w sieci komórkowej',
	'modem.revision': 'Wersja oprogramowania modemu',
	'modem.sn': 'Numer seryjny modemu',
	'modem.sysmode': 'Tryb połączenia z siecią komórkową',
	'modem.uptime': 'Czas połączenia z siecią komórkową',
	'modem.qos.rx': 'Maksymalna szybkość odbierania',
	'modem.qos.tx': 'Maksymalna szybkość nadawania',
	'modem.flow.rx': 'Dane odebrane z sieci komórkowej',
	'modem.flow.tx': 'Dane wysłane do sieci komórkowej',
	'modem.power': 'Zasilanie modemu',
	'rec.min': 'Numer najstarszego nagrania',
	'rec.max': 'Numer najnowszego nagrania',
	'sim.iccid': 'Numer ICCID karty SIM',
	'sim.imsi': 'Numer IMSI karty SIM',
	'sim.pin': 'Status PIN karty SIM',
	'sys.boot': 'Czas uruchomienia systemu',
	'sys.version': 'Wersja oprogramowania',
	'sys.usb': 'USB',
	'sys.dmi': 'DMI',
	'R': 'Stan realizacji zlecenia z chmury',
	'smart.1': 'Odsetek błędów odczytu dysku',
	'smart.2': 'Ogólna wydajność dysku',
	'smart.3': 'Średni czas rozkręcania dysku',
	'smart.4': 'Licznik rozkręceń dysku',
	'smart.5': 'Realokowane sektory dysku',
	'smart.7': 'Odsetek błędów pozycjonowania głowic dysku',
	'smart.8': 'Wydajność mechanizmu pozycjonowania dysku',
	'smart.9': 'Licznik motogodzin dysku',
	'smart.10': 'Liczba prób ponownego rozkręcenia dysku',
	'smart.12': 'Licznik włączeń/wyłączeń dysku',
	'smart.160': 'Liczba nienaprawialnych sektorów przy odczycie/zapisie',	// Transcend
	'smart.161': 'Liczba poprawnych bloków zapasowych',	// Transcend
	'smart.163': 'Liczba początkowych bloków nieprawidłowych',	// Transcend
	'smart.164': 'Liczba kasowań',	// Transcend
	'smart.165': 'Maksymalna liczba kasowań',	// Transcend
	'smart.166': 'Minimalna liczba kasowań',	// Transcend
	'smart.167': 'Średnia liczba kasowań',	// Transcend
	'smart.184': 'Błędy parzystości dysku',
	'smart.187': 'Błędy nienaprawialne przez sprzętową korekcję błędów na dysku',
	'smart.188': 'Operacje dysku niedokończone w wymaganym czasie',
	'smart.189': 'Błędy zapisu z powodu zbyt wysoko lecącej głowicy dysku',
	'smart.190': '100°C - temperatura dysku',
	'smart.192': 'Nagłe wyłączenia dysku',
	'smart.193': 'Licznik parkowania głowic dysku',
	'smart.194': 'Temperatura dysku',
	'smart.195': 'Błędy naprawione przez sprzętową korekcję błędów na dysku',
	'smart.196': 'Liczba dokonanych relokacji sektorów dysku',
	'smart.197': 'Liczba niestabilnych sektorów dysku',
	'smart.198': 'Liczba nienaprawialnych błędów odczytu/zapisu',
	'smart.199': 'Błędy ICRC podczas przesyłu danych na/z dysku kablem',
	'smart.200': 'Licznik błędów przy zapisie sektorów dysku',
	'smart.201': 'Licznik błędów zgubienia ścieżki na dysku',
	'smart.202': 'Licznik błędów znaczników adresu na dysku',
	'smart.241': 'Liczba zapisanych LBA',	// Transcend: raw*32MB
	'smart.242': 'Liczba odczytanych LBA',	// Transcend: raw*32MB
}

xlatVariableKey[SYNC_TERMOSTAT_BIN] = 'Nastawy sterownika termostatycznego'
xlatVariableKey[VAR_SYNC_PREFIX + 'nvram.bin'] = 'Nieulotna pamięć RAM'

export default Vue.extend({
	...template,
	props: {
		name: String as () => string,
	},
	computed: {
		label: function(): string {
			return xlatVariableKey[this.name]
		},
		fn: function(): string {
			return this.name.startsWith(VAR_SYNC_PREFIX)
				? this.name.substring(VAR_SYNC_PREFIX.length)
				: ''
		},
	},
})
