import * as React from "react";
import { ParseErrorOnRow } from "../../hourEntry/parseHourEntryCSV";

type ErrorsProps = {
  errors: ParseErrorOnRow[]
}

export default (props: ErrorsProps) => {
  const errorList = props.errors.map((errorOnRow, i) =>
    <div className="error" key={i}>Error on row {errorOnRow.row + 1}: "{errorOnRow.error.message}"</div>
  );

  return <div className="errors">
    <h2>Errors</h2>
    { errorList }
  </div>
}
