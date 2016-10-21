import * as React from "react";
import Person from "./Person";
import { MonthlyWageInformation } from "../../paymentCalculator/calculateWage";

type MonthProps = {
  monthlyWage: MonthlyWageInformation
}

export default (props: MonthProps) => {
  const persons = props.monthlyWage.person.map((personWages) =>
    <Person personWages={personWages} />
  )

  return <div className="month">
    <h2>Month {props.monthlyWage.month}/{props.monthlyWage.year}</h2>
    <div>{ persons }</div>
  </div>
}
