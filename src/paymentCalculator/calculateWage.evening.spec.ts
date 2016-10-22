/// <reference path="../../node_modules/@types/jasmine/index.d.ts"/>

import * as moment from 'moment';
import calculateWage, { MonthWageInfo } from './calculateWage';
import Time from '../Time';
import HourEntry from '../hourEntry/HourEntry';
import * as Big from 'big.js';

function getEveningWage(monthlyWages: MonthWageInfo[]) {
  return monthlyWages[0].person[0].monthlyWages.evening
}

describe('calculateWage()', () => {
  describe('when evening compensation end is before start', () => {
    const params = {
      regularDailyWage: new Big("1.00"),
      eveningWorkParameters: {
        extraWage: new Big("1.00"),
        start: new Time(16, 0),
        end: new Time(8, 0)
      },
      overtimeParameters: []
    }

    it('evening compensation correct', () => {
      const entries = [
        new HourEntry("foo", 1, moment("2016-01-01 06:00"), moment("2016-01-01 08:00")), // evening, 2h
        new HourEntry("foo", 1, moment("2016-01-01 08:00"), moment("2016-01-01 12:00")) // not evening, 3h
      ]
      const result = calculateWage(entries, params)
      // evening compensation from 2h => 2.00
      expect(getEveningWage(result)).toEqual("2.00")
    })

    it('evening compensation from second day correct', () => {
      const entries = [
        new HourEntry("foo", 1, moment("2016-01-01 23:00"), moment("2016-01-02 02:00")), // 3h
      ]
      const result = calculateWage(entries, params)
      // evening compensation from 3h => 3.00
      expect(getEveningWage(result)).toEqual("3.00")
    })

    it('evening compensation correct when multiple entries during evening', () => {
      const entries = [
        new HourEntry("foo", 1, moment("2016-01-01 16:00"), moment("2016-01-01 17:00")), // 1h
        new HourEntry("foo", 1, moment("2016-01-01 17:00"), moment("2016-01-01 19:00")), // 2h
      ]
      const result = calculateWage(entries, params)
      // evening compensation from 3h => 3.00
      expect(getEveningWage(result)).toEqual("3.00")
    })
  })

  describe('when evening compensation start is before end', () => {
    const params = {
      regularDailyWage: new Big("1.00"),
      eveningWorkParameters: {
        extraWage: new Big("1.00"),
        start: new Time(16, 0),
        end: new Time(23, 0)
      },
      overtimeParameters: []
    }

    it('evening compensation is correct', () => {
      const entries = [
        new HourEntry("foo", 1, moment("2016-01-01 14:00"), moment("2016-01-01 16:00")), // not evening, 3h
        new HourEntry("foo", 1, moment("2016-01-01 16:00"), moment("2016-01-01 18:00")) // evening, 2h
      ]
      const result = calculateWage(entries, params)
      // evening compensation from 2h => 2.00
      expect(getEveningWage(result)).toEqual("2.00")
    })

    it('evening compensation is correct when only part of shift is on evening', () => {
      const entries = [
        new HourEntry("foo", 1, moment("2016-01-01 22:30"), moment("2016-01-02 02:00")), // 0.5h of this during evening
      ]
      const result = calculateWage(entries, params)
      // evening compensation from 0.5h => 1.50
      expect(getEveningWage(result)).toEqual("0.50")
    })

    it('evening compensation from second day is correct', () => {
      const entries = [
        new HourEntry("foo", 1, moment("2016-01-01 23:00"), moment("2016-01-02 22:00")), // evening, 6h
      ]
      const result = calculateWage(entries, params)
      // evening compensation from 3h => 3.00
      expect(getEveningWage(result)).toEqual("6.00")
    })
  })
})
