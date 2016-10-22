/// <reference path="../../node_modules/@types/jasmine/index.d.ts"/>

import * as moment from 'moment';
import calculateWage, { MonthWageInfo } from './calculateWage';
import Time from '../Time';
import HourEntry from '../hourEntry/HourEntry';
import * as Big from 'big.js';

function getOvertimeWage(monthWages: MonthWageInfo[]) {
  return monthWages[0].person[0].dailyWages[0].wages.overtime
}

describe('calculateWage()', () => {
  describe('when overtime is from 8 hours to infinity', () => {
    const params = {
      regularDailyWage: new Big("1.00"),
      eveningWorkParameters: {
        extraWage: new Big("1.00"),
        start: new Time(16, 0),
        end: new Time(8, 0)
      },
      overtimeParameters: [
        {
          start: 8,
          end: Infinity,
          multiplier: new Big("1.00")
        }
      ]
    }

    it('under 8 hours have no overtime', () => {
      const entries = [
        new HourEntry('foo', 1, moment('2016-01-01 06:00'), moment('2016-01-01 14:00'))
      ]
      const result = calculateWage(entries, params)
      expect(getOvertimeWage(result)).toEqual('0.00')
    })

    it('over 8 hours has correct overtime', () => {
      const entries = [
        new HourEntry('foo', 1, moment('2016-01-01 06:00'), moment('2016-01-01 18:00'))
      ]
      const result = calculateWage(entries, params)
      expect(getOvertimeWage(result)).toEqual('4.00')
    })

    it('over 8 hours in multiple shifts has correct overtime', () => {
      const entries = [
        new HourEntry('foo', 1, moment('2016-01-01 06:00'), moment('2016-01-01 10:00')),
        new HourEntry('foo', 1, moment('2016-01-01 11:00'), moment('2016-01-01 18:00'))
      ]
      const result = calculateWage(entries, params)
      expect(getOvertimeWage(result)).toEqual('3.00')
    })

    it('over 8 hours where part is on another day has correct overtime', () => {
      const entries = [
        new HourEntry('foo', 1, moment('2016-01-01 22:00'), moment('2016-01-02 10:00'))
      ]
      const result = calculateWage(entries, params)
      expect(getOvertimeWage(result)).toEqual('4.00')
    })
  })

  describe('when there is different overtime multiplier between 4-8 and 8-infinity', () => {
    const params = {
      regularDailyWage: new Big("1.00"),
      eveningWorkParameters: {
        extraWage: new Big("1.00"),
        start: new Time(16, 0),
        end: new Time(8, 0)
      },
      overtimeParameters: [
        {
          start: 4,
          end: 8,
          multiplier: new Big("1.00")
        },
        {
          start: 8,
          end: Infinity,
          multiplier: new Big("2.00")
        }
      ]
    }

    it('under 4 hours has no overtime', () => {
      const entries = [
        new HourEntry('foo', 1, moment('2016-01-01 04:00'), moment('2016-01-01 08:00'))
      ]
      const result = calculateWage(entries, params)
      expect(getOvertimeWage(result)).toEqual('0.00')
    })

    it('over 4 hours but under 8 uses correct multiplier', () => {
      const entries = [
        new HourEntry('foo', 1, moment('2016-01-01 04:00'), moment('2016-01-01 09:00'))
      ]
      const result = calculateWage(entries, params)
      expect(getOvertimeWage(result)).toEqual('1.00')
    })

    it('over 8 hours uses correct multiplier for initial and after overtime hours', () => {
      const entries = [
        new HourEntry('foo', 1, moment('2016-01-01 04:00'), moment('2016-01-01 14:00'))
      ]
      const result = calculateWage(entries, params)
      // initial 4 hours = 4.00, 2 hours after = 4.00, total 8.00
      expect(getOvertimeWage(result)).toEqual('8.00')
    })
  })
})
