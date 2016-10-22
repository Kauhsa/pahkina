/// <reference path="../../node_modules/@types/jasmine/index.d.ts"/>

import * as moment from 'moment';
import calculateWage, { MonthWageInfo } from './calculateWage';
import Time from '../Time';
import HourEntry from '../hourEntry/HourEntry';
import * as Big from 'big.js';

const simpleParams = {
  regularDailyWage: new Big("1.00"),
  eveningWorkParameters: {
    extraWage: new Big("1.00"),
    start: new Time(22, 0),
    end: new Time(23, 0)
  },
  overtimeParameters: []
}

describe('calculateWage()', () => {
  it('entries that cross midnight are returned to initial day', () => {
    const entries = [
      new HourEntry("foo", 1, moment("2016-01-01 06:00"), moment("2016-01-02 05:00")),
    ]
    const result = calculateWage(entries, simpleParams)
    const days = result[0].person[0].dailyWages
    expect(days.length).toBe(1)
    expect(days[0].wages.regular).toEqual("23.00")
    expect(days[0].date).toEqual("2016-01-01")
  })

  it('entries starting in different days are returned as different days', () => {
    const entries = [
      new HourEntry("foo", 1, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
      new HourEntry("foo", 1, moment("2016-01-02 06:00"), moment("2016-01-02 08:00")),
    ]
    const result = calculateWage(entries, simpleParams)
    const days = result[0].person[0].dailyWages
    expect(days.length).toBe(2)
    expect(days[0].date).toEqual("2016-01-01")
    expect(days[0].wages.regular).toEqual("1.00")
    expect(days[1].date).toEqual("2016-01-02")
    expect(days[1].wages.regular).toEqual("2.00")
  })

  it('entries from different persons are returned as different persons', () => {
    const entries = [
      new HourEntry("foo", 1, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
      new HourEntry("fuu", 2, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
    ]
    const result = calculateWage(entries, simpleParams)
    expect(result[0].person.length).toBe(2)
    expect(result[0].person[0].id).toBe(1)
    expect(result[0].person[0].name).toBe("foo")
    expect(result[0].person[1].id).toBe(2)
    expect(result[0].person[1].name).toBe("fuu")
  })

  it('calculates entries from different months', () => {
    const entries = [
      new HourEntry("foo", 1, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
      new HourEntry("fuu", 2, moment("2016-02-01 06:00"), moment("2016-02-01 07:00")),
    ]
    const result = calculateWage(entries, simpleParams)
    expect(result.length).toBe(2)
    expect(result[0].month).toBe(0) // JS months... January = 0
    expect(result[0].year).toBe(2016)
    expect(result[1].month).toBe(1) // and February = 1
    expect(result[1].year).toBe(2016)
  })

  it('months are returned in ascending order', () => {
    // note: months in opposite order they are supposed to show in output
    const entries = [
      new HourEntry("fuu", 1, moment("2016-02-01 06:00"), moment("2016-02-01 07:00")),
      new HourEntry("foo", 1, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
    ]
    const result = calculateWage(entries, simpleParams)
    expect(result[0].month).toBe(0)
    expect(result[1].month).toBe(1)
  })

  it('daily wages are returned in ascending order', () => {
    // note: days in opposite order they are supposed to show in output
    const entries = [
      new HourEntry("fuu", 1, moment("2016-01-02 06:00"), moment("2016-01-02 07:00")),
      new HourEntry("foo", 1, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
    ]
    const result = calculateWage(entries, simpleParams)
    const days = result[0].person[0].dailyWages
    expect(days[0].date).toEqual("2016-01-01")
    expect(days[1].date).toEqual("2016-01-02")
  })

  it('persons are returned in ascending order by id', () => {
    // note: persons in opposite order they are supposed to show in output
    const entries = [
      new HourEntry("foo", 2, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
      new HourEntry("fuu", 1, moment("2016-01-01 06:00"), moment("2016-01-01 07:00")),
    ]
    const result = calculateWage(entries, simpleParams)
    expect(result[0].person[0].id).toBe(1)
    expect(result[0].person[1].id).toBe(2)
  })
})
