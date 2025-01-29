/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2017, 2018, 2019, 2021, 2022, 2023, 2025 Aleksander Mazur
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

/* ---------------------------------- */

/**
 * Array of program IDs per each week day (length = 7, 0=sunday).
 * Empty string means empty program.
 * The IDs refer to keys of ITermos.thermalPrograms or ITermos.timerPrograms.
 */
export type TTermosWeek = string[]

/** Function which turns date/time and temperature into ON/OFF/keep. */
export interface ITermosFunction {
	/** Sensor ID (6 bytes) in hex, so length = 12. */
	sensor: string
	/**
	 * Defined only if differential control is employed.
	 * In such case it is second sensor ID (6 bytes) in hex, so length = 12.
	 * Effective value is the difference between measurements of "sensor" and "diff".
	 */
	diff?: string
	/** true = cooling, false = heating. */
	cooling: boolean
	/** If true, result is ON when "sensor" or "diff" are missing. */
	critical: boolean
	/** If true, temperature should be displayed on a display. */
	display: boolean
	/** If defined, it's an index of formula which gets result of the function (indirect control). */
	formula?: number
	/** Mask of relays (direct control). */
	relays: number
	/** Array of offsets of daily programs (thermal). */
	programs: TTermosWeek
}

/** mask1 & mask2 -> result */
export interface ITermosFormula {
	/** Mask of formulas (indirect control). */
	mask1: number
	/** Mask of formulas (indirect control). */
	mask2: number
	/** Resulting mask of relays (direct control). */
	relays: number
}

/** Beginning of a time range of a daily program. */
export interface ITermosProgramTimeRange {
	/** Starting hour (0-23). */
	hh: number
	/** Starting minute within the hour (0-59). */
	mm: number
}

/** Data associated with single time range of a thermal daily program. */
export interface ITermosThermalProgramEntry extends ITermosProgramTimeRange {
	/** Set temperature (stored as fixed point 8:8, signed). */
	temp: number
	/** Hystheresis (stored as fixed point 4:4, unsigned). */
	hyst: number
}

export interface ITermosThermalPrograms {
	[program: string]: ITermosThermalProgramEntry[]
}

/** Data associated with single time range of a timer daily program. */
export interface ITermosTimerProgramEntry extends ITermosProgramTimeRange {
	/** Mask of relays to switch on. */
	relaysOn: number
	/** Mask of relays to switch off. */
	relaysOff: number
	/** Mask of relays to switch on once during time period (range). */
	relaysOnce: number
}

export interface ITermosTimerPrograms {
	[program: string]: ITermosTimerProgramEntry[]
}

/** Termos settings. */
export interface ITermos {
	/** Array of offsets of daily programs (timer). */
	timer: TTermosWeek
	/** Mask of relays (direct control). */
	watchdog: number
	/** Array of functions. */
	functions: ITermosFunction[]
	/** Array of formulas. */
	formulas: ITermosFormula[]
	/** Thermal programs (referenced from "functions"). */
	thermalPrograms: ITermosThermalPrograms
	/** Timer programs (referenced from "timer"). */
	timerPrograms: ITermosTimerPrograms
}

type TTermosProgramEntry = ITermosTimerProgramEntry | ITermosThermalProgramEntry
//type ITermosPrograms = ITermosThermalPrograms | ITermosTimerPrograms

export interface ITermosPrograms {
	[program: string]: TTermosProgramEntry[]
}

type TLoad2ndEntry = (data: Uint8Array, offset: number, range: ITermosProgramTimeRange) => TTermosProgramEntry

interface IProgramNumbers {
	[key: string]: number
}

interface IIsProgramRefered {
	[key: string]: boolean
}

/* ---------------------------------- */

/** Offset tablicy offsetów programu zegarowego na każdy dzień tygodnia (długość = 7 bajtów). */
const OUT_TIMER_PROGRAMS = 0
/** Bajt z flagami przekaźników dla watchdoga. */
const OUT_WATCHDOG_RELAYS = 7
/**
 * Offset liczby zdefiniowanych funkcji (dolne pół bajtu) i formuł (górne pół bajtu).
 * Definicje funkcji zaczynają się zaraz za.
 */
const OUT_COUNT = 8
/** Offset definicji pierwszej funkcji. */
const OUT_FUNCTION_OFFSET = 9
/** Długość definicji każdej funkcji. */
const OUT_FUNCTION_LENGTH = 0x10
/**
 * Offset bajtu z offsetem ID czujnika, którego temperaturę należy odjąć,
 * lub 0, jeśli funkcja wykorzystuje bezwzględną temperaturę jednego czujnika.
 */
const OUT_FUNCTION_DIFF = 6
/** Offset bajtu z flagami względem początku definicji funkcji. */
const OUT_FUNCTION_FLAGS = 7
/** Offset bajtu ze sterowanymi przekaźnikami względem początku definicji funkcji. */
const OUT_FUNCTION_RELAYS = 8
/** Offset tablicy offsetów programów dobowych na każdy dzień tygodnia (7 bajtów). */
const OUT_FUNCTION_DAILY = 9
/** Flaga oznaczająca, że program służy do chłodzenia, a nie grzania. */
const OUT_FUNCTION_FLAG__COOLING = 0x80
/** Flaga oznaczająca, że w przypadku braku (awarii) czujnika należy włączyć przekaźniki sterowane bezpośrednio. */
const OUT_FUNCTION_FLAG__CRITICAL = 0x40
/** Flaga oznaczająca, że temperatura powinna zostać wyświetlona na wyświetlaczu. */
const OUT_FUNCTION_FLAG__DISPLAY = 0x20
/** Flaga oznaczająca, że w 3 najmłodszych bitach jest numer wynikowego bitu sterowania pośredniego. */
const OUT_FUNCTION_FLAG__FORMULA = 0x08
/** Maska numeru formuły (obecny, gdy flaga FORMULA jest ustawiona). */
const OUT_FUNCTION_FLAG__FORMULA_MASK = 0x07
/** Długość definicji każdej formuły. */
const OUT_FORMULA_LENGTH = 3
/** Długość pojedynczego wpisu w programie dobowym. */
const OUT_PROGRAM_1ST_ENTRY_LENGTH = 2
/** Długość pojedynczego wpisu w programie dobowym. */
const OUT_PROGRAM_2ND_ENTRY_LENGTH = 3

export function termosNew(): ITermos {
	return {
		watchdog: 0,
		timer: ['', '', '', '', '', '', ''],
		functions: [],
		formulas: [],
		thermalPrograms: {},
		timerPrograms: {},
	}
}

/* ---------------------------------- */

const byte2hex = (byte: number): string => byte.toString(16).toUpperCase().padStart(2, '0')

function decodeBCD(bcd: number) {
	let result = 0
	let multi = 1
	while (bcd) {
		const digit = bcd & 0xF
		if (digit < 0 || digit > 9)
			throw new Error('Nieprawidłowy kod BCD 0x' + bcd.toString(16).toUpperCase())
		result += multi * digit
		multi *= 10
		bcd >>= 4
	}
	return result
}

function getSensorID(data: Uint8Array, offset: number): string {
	let id = ''
	for (let i = 0; i < 6; i++)
		id += byte2hex(data[offset + i])
	return id
}

function loadWeek(data: Uint8Array, offset: number, result: TTermosWeek): void {
	for (let i = 0; i < result.length; i++)
		result[i] = data[offset + i] ? '$' + byte2hex(data[offset + i]) : ''
}

function loadProgram(data: Uint8Array, offset: number, cb: TLoad2ndEntry): TTermosProgramEntry[] {
	const ranges: ITermosProgramTimeRange[] = []
	let last: boolean
	do {
		last = !!(data[offset] & 0x80)
		ranges.push({
			hh: decodeBCD(data[offset + 0] & 0x7F),
			mm: decodeBCD(data[offset + 1]),
		})
		offset += OUT_PROGRAM_1ST_ENTRY_LENGTH
	} while (!last)
	const result: TTermosProgramEntry[] = []
	for (let i = 0; i < ranges.length; i++) {
		result[i] = cb(data, offset, ranges[i])
		offset += OUT_PROGRAM_2ND_ENTRY_LENGTH
	}
	/*
	if (size < offset)
		size = offset
	*/
	return result
}

const loadTimerProgramEntry = (data: Uint8Array, offset: number, range: ITermosProgramTimeRange)
	: ITermosTimerProgramEntry => ({
	...range,
	relaysOn:   data[offset + 0],
	relaysOff:  data[offset + 1],
	relaysOnce: data[offset + 2],
})

const loadThermalProgramEntry = (data: Uint8Array, offset: number, range: ITermosProgramTimeRange)
	: ITermosThermalProgramEntry => {
	let temp: number = (data[offset + 0] << 8) | data[offset + 1]
	if (temp & 0x8000)	// sign
		temp -= 0x10000
	return {
		...range,
		temp: temp / 256,
		hyst: data[offset + 2] / 16,
	}
}

function loadMissingPrograms(data: Uint8Array, result: ITermosPrograms, week: TTermosWeek, cb: TLoad2ndEntry): void {
	for (const day of week)
		if (day.substring(0, 1) === '$' && !result[day]) {
			const offset = parseInt(day.substring(1), 16)
			if (!isNaN(offset))
				result[day] = loadProgram(data, offset, cb)
		}
}

function loadTimerPrograms(data: Uint8Array, result: ITermosTimerPrograms, week: TTermosWeek): void {
	loadMissingPrograms(data, result, week, loadTimerProgramEntry)
}

function loadThermalPrograms(data: Uint8Array, result: ITermosThermalPrograms, week: TTermosWeek): void {
	loadMissingPrograms(data, result, week, loadThermalProgramEntry)
}

export function termosDecompile(buf: ArrayBuffer): ITermos {
	const data = new Uint8Array(buf)
	if (data.length < OUT_FUNCTION_OFFSET)
		throw new Error('Plik ma tylko ' + data.length + ' B, a musi mieć co najmniej ' + OUT_FUNCTION_OFFSET + ' B')

	const count = data[OUT_COUNT]
	const formulas = count & 0xF
	const functions = (count >> 4) & 0xF
	const len = OUT_FUNCTION_OFFSET + functions * OUT_FUNCTION_LENGTH + formulas * OUT_FORMULA_LENGTH
	const result = termosNew()
	if (data.length < len)
		throw new Error('Plik ma tylko ' + data.length + ' B, a odwołuje się do miejsca pod ' + len + ' B')
	loadWeek(data, OUT_TIMER_PROGRAMS, result.timer)
	loadTimerPrograms(data, result.timerPrograms, result.timer)
	result.watchdog = data[OUT_WATCHDOG_RELAYS]
	let offset = OUT_FUNCTION_OFFSET
	for (let i = 0; i < functions; i++) {
		const flags = data[offset + OUT_FUNCTION_FLAGS]
		const func: ITermosFunction = {
			sensor: getSensorID(data, offset),
			cooling: !!(flags & OUT_FUNCTION_FLAG__COOLING),
			critical: !!(flags & OUT_FUNCTION_FLAG__CRITICAL),
			display: !!(flags & OUT_FUNCTION_FLAG__DISPLAY),
			relays: data[offset + OUT_FUNCTION_RELAYS],
			programs: ['', '', '', '', '', '', ''],
		}
		const diff = data[offset + OUT_FUNCTION_DIFF]
		if (diff)
			func.diff = getSensorID(data, diff)
		if (flags & OUT_FUNCTION_FLAG__FORMULA)
			func.formula = flags & OUT_FUNCTION_FLAG__FORMULA_MASK
		loadWeek(data, offset + OUT_FUNCTION_DAILY, func.programs)
		loadThermalPrograms(data, result.thermalPrograms, func.programs)
		result.functions[i] = func
		offset += OUT_FUNCTION_LENGTH
	}
	for (let i = 0; i < formulas; i++) {
		const formula: ITermosFormula = {
			mask1:  data[offset + 0],
			mask2:  data[offset + 1],
			relays: data[offset + 2],
		}
		result.formulas[i] = formula
		offset += OUT_FORMULA_LENGTH
	}
	if (offset !== len)
		throw new Error()
	return result
}

/* ---------------------------------- */

function putSensorID(data: Uint8Array, offset: number, id: string): void {
	if (id.length !== 12)
		throw new Error('Nieprawidłowy identyfikator czujnika: ' + id)
	for (let i = 0; i < 6; i++) {
		const byte = parseInt(id.substring(i * 2, i * 2 + 2), 16)
		if (isNaN(byte))
			throw new Error('Nieprawidłowy identyfikator czujnika: ' + id)
		data[offset + i] = byte
	}
}

function findOffsetOfSensorID(functions: ITermosFunction[], id: string): number {
	for (let i = 0; i < functions.length; i++) {
		if (functions[i].sensor !== id)
			continue
		return OUT_FUNCTION_OFFSET + i * OUT_FUNCTION_LENGTH
	}
	throw new Error('Czujnik ' + id + ' jest używany do obliczania różnicy temperatur,'
		+ ' a nie ma własnego programu, co jest wymagane')
}

function allocPrograms(termos: ITermos, offset: number): IProgramNumbers {
	const lengths: IProgramNumbers = {}
	for (const id in termos.thermalPrograms)
		if (termos.thermalPrograms[id])
			lengths[id] = termos.thermalPrograms[id].length
	for (const id in termos.timerPrograms)
		if (termos.timerPrograms[id])
			lengths[id] = termos.timerPrograms[id].length
	const oldOrder = Object.keys(lengths).sort()
	const result: IProgramNumbers = {
		'': 0,
	}
	for (const id of oldOrder) {
		result[id] = offset
		offset += lengths[id] * (OUT_PROGRAM_1ST_ENTRY_LENGTH + OUT_PROGRAM_2ND_ENTRY_LENGTH)
	}
	return result
}

function saveWeek(
	data: Uint8Array,
	week: TTermosWeek,
	offset: number,
	offsets: IProgramNumbers,
	refered: IIsProgramRefered,
): void {
	for (let i = 0; i < week.length; i++) {
		const id = week[i]
		data[offset + i] = offsets[id]
		refered[id] = true
	}
}

const byte2bcd = (x: number): number => (Math.trunc(x / 10) << 4) | (x % 10)

function saveTimeRangeEntry(data: Uint8Array, offset: number, entry: ITermosProgramTimeRange, isLast: boolean): void {
	data[offset + 0] = byte2bcd(entry.hh)
	data[offset + 1] = byte2bcd(entry.mm)
	if (isLast)
		data[offset + 0] |= 0x80
}

function saveThermalProgramEntry(data: Uint8Array, offset: number, entry: ITermosThermalProgramEntry): void {
	const t = Math.trunc(entry.temp * 0x100)
	data[offset + 0] = t >> 8
	data[offset + 1] = t & 0xFF
	const h = Math.trunc(entry.hyst * 16)
	data[offset + 2] = h
}

function saveThermalProgram(data: Uint8Array, offset: number, program: ITermosThermalProgramEntry[]): void {
	let offset2 = offset + program.length * OUT_PROGRAM_1ST_ENTRY_LENGTH
	for (let i = 0; i < program.length; i++) {
		const entry = program[i]
		saveTimeRangeEntry(data, offset, entry, i === program.length - 1)
		offset += OUT_PROGRAM_1ST_ENTRY_LENGTH
		saveThermalProgramEntry(data, offset2, entry)
		offset2 += OUT_PROGRAM_2ND_ENTRY_LENGTH
	}
}

function saveTimerProgramEntry(data: Uint8Array, offset: number, entry: ITermosTimerProgramEntry): void {
	data[offset + 0] = entry.relaysOn
	data[offset + 1] = entry.relaysOff
	data[offset + 2] = entry.relaysOnce
}

function saveTimerProgram(data: Uint8Array, offset: number, program: ITermosTimerProgramEntry[]): void {
	let offset2 = offset + program.length * OUT_PROGRAM_1ST_ENTRY_LENGTH
	for (let i = 0; i < program.length; i++) {
		const entry = program[i]
		saveTimeRangeEntry(data, offset, entry, i === program.length - 1)
		offset += OUT_PROGRAM_1ST_ENTRY_LENGTH
		saveTimerProgramEntry(data, offset2, entry)
		offset2 += OUT_PROGRAM_2ND_ENTRY_LENGTH
	}
}

export function termosCompile(termos: ITermos): ArrayBuffer {

	if (termos.functions.length >= 0x10)
		throw new Error(termos.functions.length + ' funkcji czujników to za dużo, maksymalnie może być 15')
	if (termos.formulas.length >= 0x10)
		throw new Error(termos.formulas.length + ' formuł sterowania pośredniego to za dużo, maksymalnie może być 15')
	const programOffset = OUT_FUNCTION_OFFSET
		+ termos.functions.length * OUT_FUNCTION_LENGTH
		+ termos.formulas.length * OUT_FORMULA_LENGTH
	const programsLen = (OUT_PROGRAM_1ST_ENTRY_LENGTH + OUT_PROGRAM_2ND_ENTRY_LENGTH)
		* (Object.values(termos.thermalPrograms).reduce((sum, prog) => sum + prog.length, 0)
		+ Object.values(termos.timerPrograms).reduce((sum, prog) => sum + prog.length, 0))
	if (programOffset + programsLen > 0x100)
		throw new Error('Nastawy za długie: ' + programOffset + ' + ' + programsLen +
			' = ' + (programOffset + programsLen) + ' B, a pamięć ma 256 B')
	const buffer = new ArrayBuffer(programOffset + programsLen)
	const data = new Uint8Array(buffer)

	const offsets: IProgramNumbers = allocPrograms(termos, programOffset)
	const refered: IIsProgramRefered = {}
	saveWeek(data, termos.timer, OUT_TIMER_PROGRAMS, offsets, refered)
	data[OUT_WATCHDOG_RELAYS] = termos.watchdog
	data[OUT_COUNT] = (termos.functions.length << 4) | termos.formulas.length
	let offset = OUT_FUNCTION_OFFSET
	for (const func of termos.functions) {
		putSensorID(data, offset, func.sensor)
		if (func.diff !== undefined)
			data[offset + OUT_FUNCTION_DIFF] = findOffsetOfSensorID(termos.functions, func.diff)
		let flags = 0
		if (func.cooling)
			flags |= OUT_FUNCTION_FLAG__COOLING
		if (func.critical)
			flags |= OUT_FUNCTION_FLAG__CRITICAL
		if (func.display)
			flags |= OUT_FUNCTION_FLAG__DISPLAY
		if (func.formula !== undefined) {
			if (func.formula & ~OUT_FUNCTION_FLAG__FORMULA_MASK)
				throw new Error(func.formula + ' to nieprawidłowy indeks zmiennej formuły sterowania pośredniego')
			flags |= OUT_FUNCTION_FLAG__FORMULA | func.formula
		}
		data[offset + OUT_FUNCTION_FLAGS] = flags
		data[offset + OUT_FUNCTION_RELAYS] = func.relays
		saveWeek(data, func.programs, offset + OUT_FUNCTION_DAILY, offsets, refered)
		offset += OUT_FUNCTION_LENGTH
	}
	for (const formula of termos.formulas) {
		data[offset + 0] = formula.mask1
		data[offset + 1] = formula.mask2
		data[offset + 2] = formula.relays
		offset += OUT_FORMULA_LENGTH
	}
	for (const id in termos.thermalPrograms)
		if (termos.thermalPrograms[id])
			if (!refered[id])
				throw new Error('Brak odwołań do programu dobowego temperaturowego ' + id)
			else
				saveThermalProgram(data, offsets[id], termos.thermalPrograms[id])
	for (const id in termos.timerPrograms)
		if (termos.timerPrograms[id])
			if (!refered[id])
				throw new Error('Brak odwołań do programu dobowego czasowego ' + id)
			else
				saveTimerProgram(data, offsets[id], termos.timerPrograms[id])
	return buffer
}

/* ---------------------------------- */
