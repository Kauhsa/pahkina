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

function parseHourEntryRow(row: string[]): HourEntry | ParseError {
  if (row.length != 5) {
    return new ParseError("invalid-columns", "Row should have 5 columns, had " + row.length);
  }

  const strippedRow = row.map(s => s.trim())
  const [nameToken, idToken, dateToken, startToken, endToken] = strippedRow;

  // validate name
  if (nameToken.length === 0) {
    return new ParseError("invalid-name", "Name cannot be empty")
  }

  // validate id
  if (!idToken.match(/^\d+$/)) {
    return new ParseError("invalid-id", "Id '" + idToken + "' is invalid")
  }
  const id = Number(idToken);

  // parse date
  const validDateFormats = ["DD.MM.YYYY", "D.MM.YYYY", "DD.M.YYYY", "D.M.YYYY"]
  const date = moment(dateToken, validDateFormats, true);
  if (!date.isValid()) {
    return new ParseError("invalid-date", "Date '" + dateToken + "' is invalid")
  }

  // parse start time
  const startTime = Time.fromString(startToken)
  if (startTime == null) {
    return new ParseError("invalid-time", "Time '" + startToken + "' is invalid")
  }

  // parse end time
  const endTime = Time.fromString(endToken)
  if (endTime == null) {
    return new ParseError("invalid-time", "Time '" + endToken + "' is invalid")
  }

  const startDate = date.clone().hours(startTime.hours).minutes(startTime.minutes)
  const endDate = date.clone().hours(endTime.hours).minutes(endTime.minutes)

  // is the entry ending on the following day?
  if (endDate.isBefore(startDate)) {
    endDate.add(1, "days")
  }

  return new HourEntry(nameToken, id, startDate, endDate)
}

export default function parseHourEntryCsv(data: string): ParseResult {
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
