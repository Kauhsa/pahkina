import * as React from "react";
import HourEntry from "../../hourEntry/HourEntry";
import calculateWage from "../../paymentCalculator/calculateWage";
import { DEFAULT_PARAMS } from "../../paymentCalculator/CalculationParams";

type WagesProps = {
  entries: HourEntry[];
}

export default class Wages extends React.Component<WagesProps, {}> {
  constructor() {
    super()
  }

  getCalculatedWages() {
    return calculateWage(this.props.entries, DEFAULT_PARAMS)
  }

  render() {
    return <pre>{JSON.stringify(this.getCalculatedWages(), null, 2)}</pre>
  }
}
