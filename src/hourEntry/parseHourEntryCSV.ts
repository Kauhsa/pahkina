import * as Baby from 'babyparse';
import * as moment from 'moment';
import Time from '../Time';
import HourEntry from './HourEntry';

type ParseErrorType = "invalid-columns" | "csv-error";

class ParseError {
  readonly type: ParseErrorType;
  readonly message: string;

  constructor(type: ParseErrorType, message: string) {
    this.type = type;
    this.message = message;
  }
}

class ParseResult {
  readonly entries: HourEntry[];
  readonly errors: ParseError[];

  constructor(entries: HourEntry[], errors: ParseError[]) {
    this.entries = entries;
    this.errors = errors;
  }

  hasErrors() {
    return this.errors !== null;
  }
}

class ParseErrorOnRow {
  readonly row: number;
  readonly error: ParseError;
}

function parseHourEntryRow(row: string[]): HourEntry | ParseError {
  if (row.length != 5) {
    return new ParseError("invalid-columns", "Row should have 5 columns, had " + row.length);
  }

  let [nameToken, idToken, dateToken, startToken, endToken] = row;

  let id = Number(idToken);
  let date = moment(dateToken, "DD.MM.YYYY");
  let startTime = Time.fromString(startToken)
  let endTime = Time.fromString(endToken)
  let startDate = date.clone().hours(startTime.hours).minutes(startTime.minutes)
  let endDate = date.clone().hours(endTime.hours).minutes(endTime.minutes)

  // is the entry ending on the following day?
  if (endDate.isBefore(startDate)) {
    endDate.add(1, "days")
  }

  return new HourEntry(nameToken, id, startDate, endDate)
}

export default function parseHourEntryCsv(data: string): ParseResult {
  // trim to avoid empty rows due to newline at end
  let csvParseResults = Baby.parse(data.trim())
  let parsedCsv: string[][] = csvParseResults.data
  let parsedRows = parsedCsv
    .map((row) => parseHourEntryRow(row))
  let parseHadErrors = parsedRows
    .some((result) => result instanceof ParseError)

  if (parseHadErrors) {
    return new ParseResult(null, <ParseError[]>parsedRows.filter((row) => row instanceof ParseError))
  } else {
    return new ParseResult(<HourEntry[]>parsedRows, null)
  }
}
