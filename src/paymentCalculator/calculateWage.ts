import Time from '../Time';
import HourEntry from '../hourEntry/HourEntry';
import * as Big from 'big.js';
import * as _ from 'lodash';
import * as moment from 'moment';

type CalculationParams = {
  readonly regularDailyWage: BigJsLibrary.BigJS;

  readonly eveningWorkParameters: {
    readonly multiplier: BigJsLibrary.BigJS;
    readonly start: Time;
    readonly end: Time;
  }

  readonly overtimeParameters: {
    readonly multiplier: BigJsLibrary.BigJS;
    readonly start: number;
    readonly end: number;
  }[];
}

export const DEFAULT_PARAMS: CalculationParams = {
  regularDailyWage: new Big("3.75"),

  eveningWorkParameters: {
    multiplier: new Big("0.75"),
    start: new Time(16, 0),
    end: new Time(8, 0)
  },

  overtimeParameters: [
    {
      start: 8,
      end: 10,
      multiplier: new Big("0.25")
    },
    {
      start: 10,
      end: 12,
      multiplier: new Big("0.5")
    },
    {
      start: 12,
      end: Infinity,
      multiplier: new Big("1")
    }
  ]
}

export default function calculateWage(entries: HourEntry[], params: CalculationParams) {
  return _(entries)
    .groupBy((entry) => entry.identifier)
    .mapValues((entries: HourEntry[]) => calculateForPerson(entries, params))
    .value()
}

export function calculateForPerson(entriesForPerson: HourEntry[], params: CalculationParams) {
  return _(entriesForPerson)
    .groupBy((entry) => entry.start.format('YYYY-MM-DD'))
    .mapValues((entries: HourEntry[]) => calculateForDay(entries, params))
    .value()
}

export function calculateForDay(entriesForDay: HourEntry[], params: CalculationParams) {
  const minutesOnEntry = (entry) => moment.duration(entry.end.diff(entry.start)).asMinutes()
  const minutesTotal = entriesForDay.reduce((acc, entry) => acc + minutesOnEntry(entry), 0)

  return {
    regular: getRegularWage(minutesTotal, params),
    evening: getEveningHoursWage(entriesForDay, params),
    overtime: getOvertimeWage(minutesTotal, params)
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
