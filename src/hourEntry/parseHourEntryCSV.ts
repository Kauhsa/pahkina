import * as Baby from 'babyparse';
import * as moment from 'moment';
import Time from '../Time';
import HourEntry from './HourEntry';

type ParseErrorType = "invalid-columns" |
  "invalid-name" |
  "invalid-id" |
  "invalid-date" |
  "invalid-time";

export class ParseResult {
  readonly entries: HourEntry[];
  readonly errors: ParseErrorOnRow[];

  constructor(entries: HourEntry[], errors: ParseErrorOnRow[]) {
    this.entries = entries;
    this.errors = errors;
  }

  hasErrors() {
    return this.errors !== null;
  }
}

export class ParseErrorOnRow {
  readonly row: number;
  readonly error: ParseError;

  constructor(row: number, error: ParseError) {
    this.row = row;
    this.error = error;
  }
}

class ParseError {
  readonly type: ParseErrorType;
  readonly message: string;

  constructor(type: ParseErrorType, message: string) {
    this.type = type;
    this.message = message;
  }
}

type PossibleError<T> = T | ParseError;

function parseName(nameToken: string): PossibleError<string> {
  if (nameToken.length === 0) {
    return new ParseError("invalid-name", "Name cannot be empty")
  }

  return nameToken;
}

function parseId(idToken: string): PossibleError<number> {
  if (!idToken.match(/^\d+$/)) {
    return new ParseError("invalid-id", "Id '" + idToken + "' is invalid")
  }

  return Number(idToken);
}

function parseDate(dateToken: string): PossibleError<moment.Moment> {
  const validDateFormats = ["DD.MM.YYYY", "D.MM.YYYY", "DD.M.YYYY", "D.M.YYYY"]
  const date = moment(dateToken, validDateFormats, true);

  if (!date.isValid()) {
    return new ParseError("invalid-date", "Date '" + dateToken + "' is invalid")
  }

  return date;
}

function parseTime(timeToken: string): PossibleError<Time> {
  const startTime = Time.fromString(timeToken)

  if (startTime == null) {
    return new ParseError("invalid-time", "Time '" + timeToken + "' is invalid")
  }

  return startTime;
}

function parseHourEntryRow(row: string[]): PossibleError<HourEntry> {
  if (row.length != 5) {
    return new ParseError("invalid-columns", "Row should have 5 columns, had " + row.length);
  }

  const [nameToken, idToken, dateToken, startToken, endToken] = row.map(s => s.trim());

  const name = parseName(nameToken);
  const id = parseId(idToken);
  const date = parseDate(dateToken);
  const start = parseTime(startToken);
  const end = parseTime(endToken);

  // [name, id, date, start, end].some(x => x instanceof ParseError) would be
  // cute, but type guard does not work then :(
  if (name instanceof ParseError) {
    return name;
  } else if (id instanceof ParseError) {
    return id;
  } else if (date instanceof ParseError) {
    return date;
  } else if (start instanceof ParseError) {
    return start;
  } else if (end instanceof ParseError) {
    return end;
  }

  const startDate = start.momentDateOnTime(date)
  const endDate = end.momentDateOnTime(date)

  // is the entry ending on the following day?
  if (endDate.isBefore(startDate)) {
    endDate.add(1, "days")
  }

  return new HourEntry(name, id, startDate, endDate)
}

export default function parseHourEntryCSV(data: string): ParseResult {
  // trim to avoid empty rows due to newline at end
  const csvParseResults = Baby.parse(data.trim())
  const parsedCsv: string[][] = csvParseResults.data
  const parsedRows = parsedCsv
    .map((row, i) => {
      const rowResult = parseHourEntryRow(row)

      if (rowResult instanceof ParseError) {
        return new ParseErrorOnRow(i, rowResult)
      } else {
        return rowResult;
      }
    })

  const parseHadErrors = parsedRows
    .some((result) => result instanceof ParseErrorOnRow)

  if (parseHadErrors) {
    const errors = <ParseErrorOnRow[]>parsedRows.filter((row) => row instanceof ParseErrorOnRow)
    return new ParseResult(null, errors)
  } else {
    return new ParseResult(<HourEntry[]>parsedRows, null)
  }
}
