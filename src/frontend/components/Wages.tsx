import * as React from "react";
import Month from "./Month";
import { MonthWageInfo } from "../../paymentCalculator/calculateWage";

type WagesProps = {
  monthlyWages: MonthWageInfo[];
}

export default (props: WagesProps) => {
  const monthElements = props.monthlyWages.map(monthlyWage =>
    <Month monthlyWage={monthlyWage} key={monthlyWage.year + '-' + monthlyWage.month} />
  )

  return <div className="wages">
    {monthElements}
  </div>
}
