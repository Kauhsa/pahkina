import * as moment from 'moment';

const TIME_REGEX = /^(\d{1,2}):(\d{2})$/

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

    const minutes = Number(result[1]);
    const hours = Number(result[2]);

    if (minutes < 0 || minutes > 59) {
      return null;
    }

    if (hours < 0 || hours > 23) {
      return null;
    }

    return new Time(minutes, hours)
  }

  momentDateOnTime(date: moment.Moment): moment.Moment {
    return date
      .clone()
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
