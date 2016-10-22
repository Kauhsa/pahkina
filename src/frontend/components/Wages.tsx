import * as React from "react";
import Month from "./Month";
import { MonthWageInfo } from "../../paymentCalculator/calculateWage";

type WagesProps = {
  monthlyWages: MonthWageInfo[];
}

export default (props: WagesProps) => {
  const monthElements = props.monthlyWages.map((monthlyWage) =>
    <Month monthlyWage={monthlyWage} />
  )

  return <div className="wages">
    {monthElements}
  </div>
}
