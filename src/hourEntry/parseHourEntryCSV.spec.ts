/// <reference path="../../node_modules/@types/jasmine/index.d.ts"/>

import parseHourEntryCSV from './parseHourEntryCSV';
import HourEntry from './HourEntry';
import * as moment from 'moment';

describe("parseHourEntryCsv", () => {
  const hourEntryEquality = (a, b) => {
    if (a instanceof HourEntry && b instanceof HourEntry) {
      return a.isEqual(b)
    }
  };

  beforeEach(() => {
    jasmine.addCustomEqualityTester(hourEntryEquality)
  });

  it("Parses single line successfully", () => {
    const result = parseHourEntryCSV("pekka,1,1.1.2016,8:00,16:00")
    const expected = [new HourEntry("pekka", 1, moment('2016-01-01 08:00'), moment('2016-01-01 16:00'))]
    expect(result.entries).toEqual(expected)
  });

  it("Does not mind extra newlines at the beginning or at the end", () => {
    const result = parseHourEntryCSV(`
    1,1,1.1.2016,8:00,16:00
    `)
    expect(result.entries.length).toBe(1)
  });

  it("Detects when end time is on another day", () => {
    const result = parseHourEntryCSV("pekka,1,1.1.2016,8:00,2:00")
    const expected = [new HourEntry("pekka", 1, moment('2016-01-01 08:00'), moment('2016-01-02 02:00'))]
    expect(result.entries).toEqual(expected)
  });
});
