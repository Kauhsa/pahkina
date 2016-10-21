import * as Big from 'big.js';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CalculationParams } from './CalculationParams';
import Time from '../Time';
import HourEntry from '../hourEntry/HourEntry';

/**
 * Represents wage data, for a day or a larger time period. Numbers are
 * represented as strings, fixed to two decimals.
 */
type WageInfo = {
  readonly regular: string,
  readonly evening: string,
  readonly overtime: string,
  readonly total: string
}

type DailyWageInfo = {
  readonly date: string,
  readonly wages: WageInfo
}

type WageInfoForPerson = {
  readonly id: string,
  readonly name: string,
  readonly monthlyWages: WageInfo,
  readonly dailyWages: DailyWageInfo[]
}

type WageCalculationResult = {
  readonly year: number,
  readonly month: number,
  readonly person: WageInfoForPerson[]
}[]

/**
 * Calculate wages, given (valid) entries.
 */
export default function calculateWage(entries: HourEntry[], params: CalculationParams): WageCalculationResult {
  return _(entries)
    .groupBy((entry: HourEntry) => entry.start.format('YYYY-MM'))
    .values()
    .map((entries: HourEntry[]) => ({
      year: entries[0].start.year(),
      month: entries[0].start.month(),
      person: calculateForMonth(entries, params)
    }))
    .value()
}

function calculateForMonth(entriesForMonth: HourEntry[], params: CalculationParams): WageInfoForPerson[] {
  return _(entriesForMonth)
    .groupBy((entry: HourEntry) => entry.identifier)
    .values()
    .map((entries: HourEntry[]) => {
      const dailyWages = calculateForPerson(entries, params)

      return {
        id: entries[0].identifier.toString(),
        name: entries[0].name,
        monthlyWages: getTotalMonthlyWage(dailyWages),
        dailyWages,
      }
    })
    .value()
}

function getTotalMonthlyWage(dailyWages: DailyWageInfo[]): WageInfo {
  const foo = dailyWages.reduce((acc, dailyWage) => ({
    regular: acc.regular.plus(dailyWage.wages.regular),
    evening: acc.evening.plus(dailyWage.wages.evening),
    overtime: acc.overtime.plus(dailyWage.wages.overtime),
    total: acc.total.plus(dailyWage.wages.total)
  }), {
    regular: new Big(0),
    evening: new Big(0),
    overtime: new Big(0),
    total: new Big(0)
  })

  return {
    regular: foo.regular.toFixed(2),
    evening: foo.evening.toFixed(2),
    overtime: foo.overtime.toFixed(2),
    total: foo.total.toFixed(2)
  }
}

function calculateForPerson(entriesForPerson: HourEntry[], params: CalculationParams): DailyWageInfo[] {
  return _(entriesForPerson)
    .groupBy((entry) => entry.start.format('YYYY-MM-DD'))
    .map((entries: HourEntry[], date: string) => ({
      date,
      wages: calculateForDay(entries, params)
    }))
    .value()
}

function calculateForDay(entriesForDay: HourEntry[], params: CalculationParams): WageInfo {
  const minutesOnEntry = (entry) => moment.duration(entry.end.diff(entry.start)).asMinutes()
  const minutesTotal = entriesForDay.reduce((acc, entry) => acc + minutesOnEntry(entry), 0)

  const regular = getRegularWage(minutesTotal, params).round(2)
  const evening = getEveningHoursWage(entriesForDay, params).round(2)
  const overtime = getOvertimeWage(minutesTotal, params).round(2)
  const total = regular.plus(evening).plus(overtime)

  return {
    regular: regular.toFixed(2),
    evening: evening.toFixed(2),
    overtime: overtime.toFixed(2),
    total: total.toFixed(2)
  };
}

function getRegularWage(minutesTotal: number, params: CalculationParams) {
  return new Big(minutesTotal)
    .div(60)
    .times(params.regularDailyWage)
}

function getEveningHoursWage(entriesForDay: HourEntry[], params: CalculationParams) {
  const date = entriesForDay[0].start;
  const eveningStart = params.eveningWorkParameters.start.momentDateOnTime(date)
  const eveningEnd = params.eveningWorkParameters.end.momentDateOnTime(date)

  if (eveningEnd.isBefore(eveningStart)) {
    eveningEnd.add(1, "days")
  }

  const minutesOnEveningHoursOnEntry = (entry) => {
    const start = moment.max(entry.start, eveningStart)
    const end = moment.min(entry.end, eveningEnd)
    const minutesBetweenStartAndEnd = moment.duration(end.diff(start)).asMinutes()
    return Math.max(minutesBetweenStartAndEnd, 0)
  }

  const eveningMinutesTotal = entriesForDay.reduce((acc, entry) => acc + minutesOnEveningHoursOnEntry(entry), 0)

  return new Big(eveningMinutesTotal)
    .div(60)
    .times(params.regularDailyWage)
    .times(params.eveningWorkParameters.multiplier)
}

function getOvertimeWage(minutesTotal: number, params: CalculationParams) {
  return params.overtimeParameters
    .map((overtimeParams) => {
      const maxMinutes = (overtimeParams.end - overtimeParams.start) * 60
      const minutes = Math.min(Math.max(minutesTotal - (overtimeParams.start * 60), 0), maxMinutes)
      return new Big(minutes)
        .div(60)
        .times(params.regularDailyWage)
        .times(overtimeParams.multiplier)
    })
    .reduce((acc, money) => acc.plus(money), new Big("0"))
}
