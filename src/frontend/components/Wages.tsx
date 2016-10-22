import * as React from "react";

import Month from "./Month";
import HourEntry from "../../hourEntry/HourEntry";
import calculateWage, { MonthWageInfo } from "../../paymentCalculator/calculateWage";
import { DEFAULT_PARAMS } from "../../paymentCalculator/CalculationParams";

type WagesProps = {
  entries: HourEntry[];
}

export default class Wages extends React.Component<WagesProps, {}> {
  getCalculatedWages() {
    return calculateWage(this.props.entries, DEFAULT_PARAMS)
  }

  getMonthElements() {
    return this.getCalculatedWages().map((monthlyWage) =>
      <Month monthlyWage={monthlyWage} />
    )
  }

  render() {
    return <div>
      {this.getMonthElements()}
    </div>
  }
}
