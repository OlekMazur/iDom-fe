/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2019, 2020, 2022 Aleksander Mazur
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

import template from './USSDHints.vue.js'
import Vue from 'vue'
import './USSDHints.css'

interface IUSSDCode {
	code: string
	desc: string
	price?: string
}

interface IOperatorHints {
	operator: string
	logo: string
	href: string
	codes: IUSSDCode[]
}

interface IAllHints {
	[plmn: string]: IOperatorHints
}

// tslint:disable no-duplicate-string

const ussdhints: IAllHints = {
	'26015': {
		operator: 'a2mobile',
		logo: 'https://a2mobile.pl/assets/gfx/a2mobile-logo.svg',
		href: 'https://a2mobile.pl/kody-aktywacyjne',
		codes: [{
			code: '*111#',
			desc: 'Sprawdzenie stanu konta',
		}, {
			code: '*222#',
			desc: 'Sprawdzenie taryfy',
		}, {
			code: '*200#',
			desc: 'Sprawdzenie stanu internetu',
		}, {
			code: '*222*7#',
			desc: 'Aktywacja niewyczerpalnego pakietu 5 GB bez limitu prędkości',
			price: '12,90 zł',
		}, {
			code: '*222*0#',
			desc: 'Wyłączenie automatycznego odnowienia niewyczerpalnego pakietu',
		}, {
			code: '*234*1#',
			desc: 'Aktywacja jednorazowego pakietu 5 GB bez limitu prędkości (ważnego do końca okresu ważności pakietu głównego)',
			price: '5 zł',
		}],
	},
	'26006': {
		operator: 'Virgin Mobile',
		logo: 'https://virginmobile.pl/static/img/mobile_app.png',
		href: 'https://virginmobile.pl/kody-ussd',
		codes: [{
			code: '*101#',
			desc: 'Sprawdzenie stanu konta',
		}, {
			code: '*222#',
			desc: 'Sprawdzenie stanu pakietu zintegrowanego',
		}, {
			code: '*108#',
			desc: 'Sprawdzenie stanu internetu',
		}, {
			code: '*222*03#',
			desc: 'Aktywacja pakietu #MINI3',
			price: '3 zł',
		}, {
			code: '*222*25*1#',
			desc: 'Aktywacja pakietu 1GB w ramach #MINI',
			price: '1 zł',
		}, {
			code: '*120*numer#',
			desc: 'Wysłanie SMS-a pod podany numer z prośbą o oddzwonienie',
		}],
	},
	'26003': {
		operator: 'Orange',
		logo: 'https://www.orange.pl/medias/sys_master/images/images/h9b/h7a/8888162811934/logo-orange-65Wx65H.png',
		href: 'https://www.orange.pl/omnibook/zarzadzanie-kontem-przez-twoje-menu-ussd',
		codes: [{
			code: '*124*#',
			desc: 'Sprawdzenie stanu konta',
		}, {
			code: '*101*01#',
			desc: 'Sprawdzenie stanu internetu',
		}, {
			code: '*110*20*00#',
			desc: 'Wyłączenie poczty głosowej',
		}, {
			code: '*110*20#',
			desc: 'Włączenie poczty głosowej',
		}],
	},
	'26017': {
		operator: 'Aero2',
		logo: 'https://aero2.pl/gfx/page_logo.svg',
		href: 'http://bdi.free.aero2.net.pl:8080',
		codes: [],
	},
	'26001': {
		operator: 'Plus',
		logo: 'https://api.plus.pl/jcr/files/file/adp/files/images_lp/plus/logo.svg',
		href: 'https://www.plushbezlimitu.pl/na-karte/krotkie-kody',
		codes: [{
			code: '*100#',
			desc: 'Sprawdzenie stanu konta',
		}, {
			code: '*136#',
			desc: 'Sprawdzenie stanu internetu',
		}, {
			code: '*122#',
			desc: 'Sprawdzenie stanu poczty głosowej',
		}, {
			code: '*122*00#',
			desc: 'Wyłączenie poczty głosowej',
		}, {
			code: '*122*11#',
			desc: 'Włączenie poczty głosowej',
		}, {
			code: '*123*TELEKOD#',
			desc: 'Doładowanie konta',
		}, {
			code: '*136*11*10#',
			desc: 'Rok ważności konta',
		}],
	},
}

export default Vue.extend({
	...template,
	props: {
		imsi: String as () => string,
	},
	computed: {
		plmn: function(): string {
			return this.imsi ? this.imsi.substring(0, 5) : ''
		},
		hints: function(): IOperatorHints {
			return ussdhints[this.plmn] || {
				operator: '',
				href: '',
				codes: [],
			}
		},
	},
})
