/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2021 Aleksander Mazur
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

import template from './NeighbourDevice.vue.js'
import Vue from 'vue'
import { INeighbourDevice } from './neighbours'
import { formatNumberWithUnit } from '../format'
import SensorDeviceForm from '../things/SensorDeviceForm'
import Timestamp from '../things/Timestamp'
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons/faCircleNotch'

/**************************************/

interface IMap {
	[key: string]: string
}

function mapBits(mask: number, map: IMap): string[] {
	const result: string[] = []
	for (const bit in map)
		if (mask & parseInt(bit, 10))
			result.push(map[bit])
	return result
}

/**************************************/

const btMajorClass: IMap = {
	'0': 'Inne',
	'1': 'Komputer',
	'2': 'Telefon',
	'3': 'Dostęp do sieci lokalnej',
	'4': 'Audio/Video',
	'5': 'Peryferia',
	'6': 'Przetwarzanie obrazu',
	'7': 'Urządzenie noszone',
	'8': 'Zabawka',
}

const btMinorClassPeripheral: IMap = {
	'1': 'joystick',
	'2': 'gamepad',
	'3': 'pilot zdalnego sterowania',
	'4': 'czujnik',
	'5': 'tablet graficzny',
	'6': 'czytnik kart',
}

const btMinorClassImagingMasks: IMap = {
	'4': 'wyświetlacz',
	'8': 'kamera',
	'16': 'skaner',
	'32': 'drukarka',
}

const btServiceClassMasks: IMap = {
	'8192': 'ograniczony tryb wykrywalny',
	'65536': 'lokalizacja',
	'131072': 'sieć',
	'262144': 'rendering',
	'524288': 'przechwytywanie',
	'1048576': 'przesyłanie obiektów',
	'2097152': 'audio',
	'4194304': 'telefonia',
	'8388608': 'usługi informacyjne',
}

type TBTMinorFunction = (minor: number) => string

interface IBTClassMap {
	[key: string]: IMap | TBTMinorFunction
}

function btMinorPeripheral(minor: number): string {
	const keyboard = minor & 0x10 ? 'klawiatura' : ''
	const mouse = minor & 0x20 ? 'mysz' : ''
	let result = keyboard + (keyboard && mouse ? ' + ' : '') + mouse
	minor = minor & 0xF
	if (btMinorClassPeripheral[minor]) {
		if (result)
			result += ' / '
		result += btMinorClassPeripheral[minor]
	}
	return result
}

function btMinorImaging(minor: number): string {
	return mapBits(minor, btMinorClassImagingMasks).join(', ')
}

const btMajorMinorClass: IBTClassMap = {
	'1': {
		'1': 'stacja robocza',
		'2': 'serwer',
		'3': 'laptop',
		'4': 'podręczny',
		'5': 'palm',
		'6': 'noszony',
	},
	'2': {
		'1': 'komórkowy',
		'2': 'bezprzewodowy',
		'3': 'smartfon',
		'4': 'modem kablowy albo bramka głosowa',
		'5': 'ISDN',
		'6': 'czytnik kart SIM',
	},
	'4': {
		'1': 'zestaw nagłowny',
		'2': 'słuchawki z mikrofonem',
		'4': 'mikrofon',
		'5': 'głośnik',
		'6': 'słuchawki',
		'7': 'przenośne audio',
		'8': 'Car Audio',
		'9': 'Set-top box',
		'10': 'urządzenie Audio HiFi',
		'11': 'VCR',
		'12': 'kamera video',
		'13': 'kamkorder',
		'14': 'monitor video',
		'15': 'wyświetlacz i głośnik',
		'16': 'videokonferencja',
		'18': 'gra/zabawka',
	},
	'5': btMinorPeripheral,
	'6': btMinorImaging,
	'7': {
		'1': 'zegarek na rękę',
		'2': 'pager',
		'3': 'kurtka',
		'4': 'hełm',
		'5': 'okulary',
	},
	'8': {
		'1': 'robot',
		'2': 'pojazd',
		'3': 'lalka',
		'4': 'kontroler',
		'5': 'gra',
	},
}

/**************************************/

export default Vue.extend({
	...template,
	components: { SensorDeviceForm, Timestamp },
	props: {
		nd: Object as () => INeighbourDevice,
	},
	data: function() {
		return {
			iconOn: faCircle,
			iconOff: faCircleNotch,
			timeout: 60,
		}
	},
	computed: {
		rssi: function(): string | undefined {
			return this.nd.props['rssi']
				? formatNumberWithUnit(parseInt(this.nd.props.rssi.value, 10), 'dBm')
				: undefined
		},
		cls: function(): number | undefined {
			const val = this.nd.props.class
			return val !== undefined && val.value.length === 6 && /^[0-9a-fA-F]+$/.test(val.value)
				? parseInt(val.value, 16)
				: undefined
		},
		devMajorClass: function(): number | undefined {
			return this.cls === undefined ? undefined : (this.cls >> 8) & 0x1F
		},
		devMinorClass: function(): number | undefined {
			return this.cls === undefined ? undefined : (this.cls >> 2) & 0x3F
		},
		clsStr: function(): string {
			let result = ''
			if (this.devMajorClass !== undefined) {
				if (btMajorClass[this.devMajorClass])
					result += btMajorClass[this.devMajorClass]
				if (this.devMinorClass !== undefined) {
					const btMinorClass = btMajorMinorClass[this.devMajorClass]
					if (btMinorClass) {
						const minor = typeof btMinorClass === 'function'
							? btMinorClass(this.devMinorClass)
							: btMinorClass[this.devMinorClass]
						if (minor) {
							if (result)
								result += ' - '
							result += minor
						}
					}
				}
			}
			return result
		},
		services: function(): string[] {
			return this.cls === undefined ? [] : mapBits(this.cls, btServiceClassMasks)
		},
		url: function() {
			// bts/plmn.lac.ci
			const ids = this.nd.thing.name && this.nd.thing.name.split('/')
			if (ids && ids[0] === 'bts') {
				const btsID = ids[1].split('.')
				if (btsID.length === 3) {
					const cid = parseInt(btsID[2], 16)
					if (!isNaN(cid)) {
						return 'http://beta.btsearch.pl/bts/?query=' + cid
					}
				}
			}
			return ''
		},
	},
})
