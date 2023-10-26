/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2021, 2022, 2023 Aleksander Mazur
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

import { IDataListener } from './API'

/*------------------------------------*/

export type ISystemInfoBoolean = 0 | 1

/*------------------------------------*/

export interface ISystemInfo {
	kernelVersion?: string
	clock?: number		// epoch time [s]
	uptime?: number		// s (fractional)
	idletime?: number	// s (fractional)
	load1m?: number
	load5m?: number
	load15m?: number
	procRunning?: number
	procAll?: number
	memTotalKB?: number	// KB
	memFreeKB?: number	// KB
	cpu?: ISystemInfoCPU[]
	interfaces?: ISystemInfoNetwork
	resolver?: string[]
	media?: ISystemInfoMedia
	mount?: ISystemInfoMount
	leases?: ISystemInfoLease[]
	services?: ISystemInfoServices
	printers?: ISystemInfoPrinters
}

/*------------------------------------*/

export interface ISystemInfoCPU {
	modelName?: string
	busMHz?: number
}

/*------------------------------------*/

export interface ISystemInfoNetwork {
	[name: string]: ISystemInfoNetIf
}

export interface ISystemInfoNetIf {
	address?: string	// IP
	rxBytes?: number
	rxPackets?: number
	rxErrs?: number
	rxDrop?: number
	rxFifo?: number
	rxFrame?: number
	rxCompressed?: number
	rxMulticast?: number
	txBytes?: number
	txPackets?: number
	txErrs?: number
	txDrop?: number
	txFifo?: number
	txColls?: number
	txCarrier?: number
	txCompressed?: number
}

/*------------------------------------*/

export interface ISystemInfoMedia {
	// "sda": {...}
	[name: string]: ISystemInfoMedium
}

export interface ISystemInfoMedium {
	modelName?: string
	sectors?: number
	removable?: ISystemInfoBoolean
	upstream?: ISystemInfoBoolean
	avail?: number
}

/*------------------------------------*/

export interface ISystemInfoMount {
	// "dvr": "sda"
	[func: string]: string
}

/*------------------------------------*/

export interface ISystemInfoLease {
	ts?: number
	mac?: string
	ip?: string	// IP
	name?: string
	txPackets?: number
	txBytes?: number
	rxPackets?: number
	rxBytes?: number
}

/*------------------------------------*/

export interface ISystemInfoServices {
	[name: string]: ISystemInfoService
}

export interface ISystemInfoServiceStatus {
	[name: string]: string
}

export interface ISystemInfoService {
	normally_down?: ISystemInfoBoolean
	elapsed?: number	// s
	run?: ISystemInfoBoolean
	paused?: ISystemInfoBoolean
	want_down?: ISystemInfoBoolean
	got_term?: ISystemInfoBoolean
	want_up?: ISystemInfoBoolean
	mem_virt?: number	// KB
	mem_rss?: number	// KB
	cpu_utime?: number	// s (fractional)
	cpu_stime?: number	// s (fractional)
	info?: ISystemInfoServiceStatus
	status?: ISystemInfoServiceStatus
}

/*------------------------------------*/

export interface ISystemInfoPrinters {
	[name: string]: ISystemInfoPrinter
}

export interface ISystemInfoPrinter {
	manufacturer?: string
	modelName?: string
	className?: string
	commandSet?: string
	status?: string
	description?: string
	memory?: string
}

/*------------------------------------*/

export interface ISystemInfoListener extends IDataListener {
	systemInfoChanged: (systemInfo: ISystemInfo) => void
}
