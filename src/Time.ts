import * as moment from 'moment';

const TIME_REGEX = /^(\d{1,2}):(\d{1,2})$/

/**
 * Class for representing hours and minutes.
 */
export default class Time {
  readonly hours: number;
  readonly minutes: number;

  constructor(hours: number, minutes: number) {
    this.hours = hours;
    this.minutes = minutes;
  }

  static fromString(s: string): Time {
    const result = TIME_REGEX.exec(s);

    if (!result) {
      return null;
    }

    return new Time(Number(result[1]), Number(result[2]))
  }

  momentDateOnTime(date: moment.Moment): moment.Moment {
    return date.clone()
      .hours(this.hours)
      .minutes(this.minutes)
      .seconds(0)
      .milliseconds(0)
  }

  isBefore(another: Time) {
    return this.hours < another.hours ||
      (this.hours == another.hours && this.minutes < another.minutes)
  }
}
