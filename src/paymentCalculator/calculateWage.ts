import * as Big from 'big.js';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CalculationParams } from './CalculationParams';
import Time from '../Time';
import HourEntry from '../hourEntry/HourEntry';

/**
 * Represents wage data, for a day or a larger time period. Numbers are
 * represented as strings, fixed to two decimals. Not using Big.js, as the
 * structure is designed to be serializable to and from JSON.
 *
 * Note: unlike the exercise description, regular also includes the regular wage
 * parts of evening and overtime wages.
 */
export type WageInfo = {
  readonly regular: string,
  readonly evening: string,
  readonly overtime: string,
  readonly total: string
}

/**
 * Wage info for a single day for a single person.
 */
export type DayWageInfo = {
  readonly date: string, // YYYY-MM-DD string
  readonly wages: WageInfo
}

/**
 * Wage info for a person in a single month.
 */
export type PersonWageInfo = {
  readonly id: string,
  readonly name: string,
  readonly monthlyWages: WageInfo,
  readonly dailyWages: DayWageInfo[]
}

/**
 * Wage info for a multiple persons in a single month.
 */
export type MonthWageInfo = {
  readonly year: number,
  readonly month: number,
  readonly person: PersonWageInfo[]
}

/**
 * Calculate wages by month, sorted by month in ascending order.
 *
 * Some limitations:
 * - Given overlapping hour entries, it will consider that person has been
 *   working twice as hard during the overlapping period :-)
 */
export default function calculateWage(entries: HourEntry[], params: CalculationParams): MonthWageInfo[] {
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

/**
 * Calculate wages for a single month. Assumes that entriesForMonth are all
 * on a single month. Daily wages are sorted in ascending order.
 */
function calculateForMonth(entriesForMonth: HourEntry[], params: CalculationParams): PersonWageInfo[] {
  return _(entriesForMonth)
    .groupBy((entry: HourEntry) => entry.identifier)
    .values()
    .map((entries: HourEntry[]) => {
      const dailyWages = calculateForPerson(entries, params)

      return {
        id: entries[0].identifier.toString(),
        name: entries[0].name,
        monthlyWages: sumWageInfo(dailyWages.map(daily => daily.wages)),
        dailyWages,
      }
    })
    .value()
}

/**
 * Calculate daily wages for a single person. Assumes that entriesForPerson are
 * from the same person.
 */
function calculateForPerson(entriesForPerson: HourEntry[], params: CalculationParams): DayWageInfo[] {
  return _(entriesForPerson)
    .groupBy(entry => entry.start.format('YYYY-MM-DD'))
    .map((entries: HourEntry[], date: string) => ({
      date,
      wages: calculateForDay(entries, params)
    }))
    .value()
}

/**
 * Calculates wage info for a single day. Assumes that entriesForDay are all
 * from the same day.
 */
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

/**
 * Get regular wage. Also includes "regular wage" portions of evening and
 * overtime wage.
 */
function getRegularWage(minutesTotal: number, params: CalculationParams) {
  return new Big(minutesTotal)
    .div(60)
    .times(params.regularDailyWage)
}

type DateRange = {
  start: moment.Moment,
  end: moment.Moment
}

/**
 * Calculate evening hours wage. Assumes that all entries start from the same
 * day and the end is less than 24 hours after it.  Differs from the exercise
 * description in that it does *not* calculate the regular wage – only the extra
 * wage.
 */
function getEveningHoursWage(entriesForDay: HourEntry[], params: CalculationParams) {
  /*
   * OK, there are two different cases here. First, realize that one day
   * entries can actually contain data from two different days. For example, a
   * shift from 23:59 to 22:00 would almost completely on the next days side.
   *
   * With that in mind, the following are two hours in a line, and start of
   * different days are marked on a a line as 1 and 2, respectively.
   *
   * 1                       2
   * ------------------------------------------------
   *
   * In the first case that start time is before end time (such as 16:00-22:00),
   * this is simple: the hours where evening compensation should be given
   * (marked with x) looks like this:
   *
   * 1                       2
   * ----------------xxxxxx------------------xxxxxx--
   *
   * The second case isn't quite as simple. If start time is _after_ end time,
   * such as (22:00-4:00), the hours where evening compensation should be given
   * looks like this:
   *
   * 1                       2
   * xxxx------------------xxxxxx------------------xx
   *
   * So, our solution is for each case to figure out which ranges extra money
   * should be given in each case and then check the overlap of these ranges
   * in comparison to ranges in entries.
   */

  const eveningParams = params.eveningWorkParameters;
  const date = entriesForDay[0].start.clone().startOf("day");
  const nextDate = date.clone().add(1, "days");
  let ranges: DateRange[];

  // figure out which case this is – first or second?
  if (!eveningParams.end.isBefore(eveningParams.start)) {
    ranges = [
      {
        start: eveningParams.start.momentDateOnTime(date),
        end: eveningParams.end.momentDateOnTime(date)
      },
      {
        start: eveningParams.start.momentDateOnTime(nextDate),
        end: eveningParams.end.momentDateOnTime(nextDate)
      }
    ]
  } else {
    ranges = [
      {
        start: date.clone().startOf("day"),
        end: eveningParams.end.momentDateOnTime(date)
      },
      {
        start: eveningParams.start.momentDateOnTime(date),
        end: eveningParams.end.momentDateOnTime(nextDate)
      },
      {
        start: eveningParams.start.momentDateOnTime(nextDate),
        end: nextDate.clone().endOf("day")
      }
    ]
  }

  // calculate how many on entries of a date overlap this range
  const minutesOnEveningHoursOnEntry = (entry: HourEntry) => {
    const entryRange = { start: entry.start, end: entry.end }
    return ranges.reduce(
      (acc, range) => acc + getOverlappingMinutes(range, entryRange),
      0
    )
  }

  const eveningMinutesTotal = entriesForDay.reduce(
    (acc, entry) => acc + minutesOnEveningHoursOnEntry(entry),
    0
  )

  // and finally, turn the minutes to money
  return new Big(eveningMinutesTotal)
    .div(60)
    .times(params.regularDailyWage)
    .times(params.eveningWorkParameters.multiplier)
}

/**
 * Return how many overlapping minutes there are between first and second date
 * ranges.
 */
function getOverlappingMinutes(first: DateRange, second: DateRange): number {
  const start = moment.max(first.start, second.start)
  const end = moment.min(first.end, second.end)
  return Math.max(0, moment.duration(end.diff(start)).asMinutes())
}

/**
 * Calculate overtime wage. Differs from the exercise description in that
 * it does *not* calculate the regular wage – only the extra wage.
 */
function getOvertimeWage(minutesTotal: number, params: CalculationParams) {
  /*
   *
   */
  return params.overtimeParameters
    .map(overtimeParams => {
      const maxMinutes = (overtimeParams.end - overtimeParams.start) * 60
      const minutes = Math.min(Math.max(minutesTotal - (overtimeParams.start * 60), 0), maxMinutes)
      return new Big(minutes)
        .div(60)
        .times(params.regularDailyWage)
        .times(overtimeParams.multiplier)
    })
    .reduce((acc, money) => acc.plus(money), new Big("0"))
}

/**
 * Sum multiple WageInfo objects into one. Assumes that total is correct in
 * original WageInfo objects when creating total for the new one.
 */
function sumWageInfo(wageList: WageInfo[]): WageInfo {
  const totalWage = wageList.reduce((acc, wageInfo) => ({
    regular: acc.regular.plus(wageInfo.regular),
    evening: acc.evening.plus(wageInfo.evening),
    overtime: acc.overtime.plus(wageInfo.overtime),
    total: acc.total.plus(wageInfo.total)
  }), {
    regular: new Big(0),
    evening: new Big(0),
    overtime: new Big(0),
    total: new Big(0)
  })

  return {
    regular: totalWage.regular.toFixed(2),
    evening: totalWage.evening.toFixed(2),
    overtime: totalWage.overtime.toFixed(2),
    total: totalWage.total.toFixed(2)
  }
}
