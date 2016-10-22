import * as React from "react";

import Month from "./Month";
import { MonthWageInfo } from "../../paymentCalculator/calculateWage";
import { DEFAULT_PARAMS } from "../../paymentCalculator/CalculationParams";

type WagesProps = {
  monthlyWages: MonthWageInfo[];
}

export default class Wages extends React.Component<WagesProps, {}> {
  getMonthElements() {
    return this.props.monthlyWages.map((monthlyWage) =>
      <Month monthlyWage={monthlyWage} />
    )
  }

  render() {
    return <div>
      {this.getMonthElements()}
    </div>
  }
}
