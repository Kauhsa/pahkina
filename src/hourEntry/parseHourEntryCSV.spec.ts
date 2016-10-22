/// <reference path="../../node_modules/@types/jasmine/index.d.ts"/>

import parseHourEntryCSV, {ParseResult} from './parseHourEntryCSV';
import HourEntry from './HourEntry';
import * as moment from 'moment';

function expectResultToHaveError(result: ParseResult, type: string, row: number) {
  expect(result.hasErrors()).toBe(true)
  expect(result.entries).toBe(null)
  const matchingError = errorOnRow => errorOnRow.error.type === type && errorOnRow.row === row
  expect(result.errors.some(matchingError)).toBe(true)
}

describe("parseHourEntryCSV()", () => {
  const hourEntryEquality = (a, b) => {
    if (a instanceof HourEntry && b instanceof HourEntry) {
      return a.isEqual(b)
    }
  };

  beforeEach(() => {
    jasmine.addCustomEqualityTester(hourEntryEquality)
  });

  it("parses single line successfully", () => {
    const result = parseHourEntryCSV("pekka,1,1.1.2016,8:00,16:00")
    const expected = [new HourEntry("pekka", 1, moment('2016-01-01 08:00'), moment('2016-01-01 16:00'))]
    expect(result.entries).toEqual(expected)
  });

  it("does not mind whitespace before and after entries", () => {
    const result = parseHourEntryCSV("pekka  ,1,  1.1.2016,8:00   ,        16:00      ")
    const expected = [new HourEntry("pekka", 1, moment('2016-01-01 08:00'), moment('2016-01-01 16:00'))]
    expect(result.entries).toEqual(expected)
  });

  it("does not mind extra newlines at the beginning or at the end", () => {
    const result = parseHourEntryCSV(`
    1,1,1.1.2016,8:00,16:00
    `)
    expect(result.entries.length).toBe(1)
  });

  it("detects when end time is on next day", () => {
    const result = parseHourEntryCSV("pekka,1,1.1.2016,8:00,2:00")
    const expected = [new HourEntry("pekka", 1, moment('2016-01-01 08:00'), moment('2016-01-02 02:00'))]
    expect(result.entries).toEqual(expected)
  });

  it("returns an error if name is empty", () => {
    const result = parseHourEntryCSV(",1,1.1.2016,8:00,10:00")
    expectResultToHaveError(result, "invalid-name", 0)
  })

  it("returns an error if id is not a number", () => {
    const result = parseHourEntryCSV("foo,1asd,1.1.2016,8:00,10:00")
    expectResultToHaveError(result, "invalid-id", 0)
  })

  it("returns an error if date has correct format but is invalid", () => {
    const result = parseHourEntryCSV("foo,1,31.6.2016,8:00,10:00")
    expectResultToHaveError(result, "invalid-date", 0)
  })

  it("returns an error if date is nonsense", () => {
    const result = parseHourEntryCSV("foo,1,HAI LINUX,8:00,10:00")
    expectResultToHaveError(result, "invalid-date", 0)
  })

  it("returns error if time has correct format but is invalid", () => {
    const result = parseHourEntryCSV("foo,1,1.1.2016,8:60,10:00")
    expectResultToHaveError(result, "invalid-time", 0)
  })

  it("returns error if time is nonsense", () => {
    const result = parseHourEntryCSV("foo,1,1.1.2016,8:50,asdasd")
    expectResultToHaveError(result, "invalid-time", 0)
  })

  it("does not return valid results if any entry is invalid", () => {
    const csv = `
      foo,1,1.1.2015,1:00,2:00
      foo,1,1.1.2016,8:50,asdasd
    `
    const result = parseHourEntryCSV(csv)
    expect(result.entries).toBe(null)
  })

  it("returns errors from multiple rows", () => {
    const csv = `
      foo,1,1.0.2015,1:00,2:00
      foo,1,1.1.2016,8:50,asdasd
    `
    const result = parseHourEntryCSV(csv)
    expectResultToHaveError(result, "invalid-date", 0)
    expectResultToHaveError(result, "invalid-time", 1)
  })

  it("returns only one error per row", () => {
    const result = parseHourEntryCSV("foo,asd,1.0.2015,lol,2:00")
    expect(result.errors.length).toBe(1)
  })
});
