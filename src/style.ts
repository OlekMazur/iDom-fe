/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019 Aleksander Mazur
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

import { ISensor, IDevice, IVariable, INeighbour, SYNC_TERMOSTAT_BIN } from './data/Things'

/**************************************/

import { IconDefinition } from '@fortawesome/fontawesome-common-types'

import { faThermometerHalf } from '@fortawesome/free-solid-svg-icons/faThermometerHalf'
import { faSignal } from '@fortawesome/free-solid-svg-icons/faSignal'
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt'

import { faPlug } from '@fortawesome/free-solid-svg-icons/faPlug'
import { faBullhorn } from '@fortawesome/free-solid-svg-icons/faBullhorn'
import { faFire } from '@fortawesome/free-solid-svg-icons/faFire'
import { faSolarPanel } from '@fortawesome/free-solid-svg-icons/faSolarPanel'
import { faSnowflake  } from '@fortawesome/free-solid-svg-icons/faSnowflake'
import { faExclamation } from '@fortawesome/free-solid-svg-icons/faExclamation'
import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo'
import { faFaucet } from '@fortawesome/free-solid-svg-icons/faFaucet'
import { faFan } from '@fortawesome/free-solid-svg-icons/faFan'
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey'

import { faHourglass } from '@fortawesome/free-solid-svg-icons/faHourglass'
import { faUsb } from '@fortawesome/free-brands-svg-icons/faUsb'
import { faLinux } from '@fortawesome/free-brands-svg-icons/faLinux'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons/faCreditCard'
import { faHdd } from '@fortawesome/free-solid-svg-icons/faHdd'
import { faBroadcastTower } from '@fortawesome/free-solid-svg-icons/faBroadcastTower'
import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons/faFileAlt'
import { faSlidersH } from '@fortawesome/free-solid-svg-icons/faSlidersH'
import { faFilm } from '@fortawesome/free-solid-svg-icons/faFilm'

import { faBluetooth } from '@fortawesome/free-brands-svg-icons/faBluetooth'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret'

/**************************************/

export function getSensorIcon(sensor: ISensor): IconDefinition {
	const {
		unit,
	} = sensor
	if (unit === '°C')
		return faThermometerHalf
	if (unit.startsWith('dB'))
		return faSignal
	return faTachometerAlt
}

export function getDeviceIcon(device: IDevice): IconDefinition {
	if (device.name)
		switch (device.name.split('/')[0]) {
			case 'termostat':
				return faExclamation
			case 'video':
				return faVideo
		}
	if (device.alias) {
		const aliasLC = device.alias.toLowerCase()
		if (aliasLC.includes('piszcz'))
			return faBullhorn
		if (aliasLC.includes('kocioł') || aliasLC.includes('kotł'))
			return faFire
		if (aliasLC.includes('lodówka'))
			return faSnowflake
		if (aliasLC.includes('słoneczn') || aliasLC.includes('słońc'))
			return faSolarPanel
		if (aliasLC.includes('hydro'))
			return faFaucet
		if (aliasLC.includes('wentyl'))
			return faFan
		if (aliasLC.includes('drzwi') || aliasLC.includes('zamek'))
			return faKey
	}
	return faPlug
}

export function getVariableIcon(variable: IVariable): IconDefinition {
	switch (variable.key) {
		case 'sys.boot':
			return faHourglass
		case 'sys.usb':
			return faUsb
		case 'sys.version':
			return faLinux
		case 'R':
			return faCog
		case 'modem.plmn':
		case 'modem.ci':
		case 'modem.lac':
		case 'modem.reg':
			return faBroadcastTower
		case SYNC_TERMOSTAT_BIN:
			return faSlidersH
	}
	switch (variable.key.split('.')[0]) {
		case 'modem':
			return faPhone
		case 'sim':
			return faCreditCard
		case 'smart':
			return faHdd
		case 'sync':
			return faFileAlt
		case 'rec':
			return faFilm
	}
	return faInfo
}

export function getNeighbourIcon(neighbour: INeighbour): IconDefinition {
	if (neighbour.name)
		switch (neighbour.name.split('/')[0]) {
			case 'bt':
				return faBluetooth
			case 'bts':
				return faBroadcastTower
			case 'tel':
				return faPhone
		}
	return faUserSecret
}
