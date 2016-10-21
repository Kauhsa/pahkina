import { Moment } from 'moment';

export default class HourEntry {
  readonly name: string;
  readonly identifier: number;
  readonly start: Moment;
  readonly end: Moment;

  constructor(name: string, identifier: number, start: Moment, end: Moment) {
      this.name = name;
      this.identifier = identifier;
      this.start = start;
      this.end = end;
  }

  isEqual(another: HourEntry) {
    return this.name === another.name &&
      this.identifier === another.identifier &&
      this.start.isSame(another.start) &&
      this.end.isSame(another.end);
  }
}
