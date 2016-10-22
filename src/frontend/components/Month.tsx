import * as React from "react";
import Person from "./Person";
import { MonthWageInfo } from "../../paymentCalculator/calculateWage";

type MonthProps = {
  monthlyWage: MonthWageInfo
}

export default (props: MonthProps) => {
  const persons = props.monthlyWage.person.map(personWages =>
    <Person key={personWages.id} personWages={personWages} />
  )

  return <div className="month">
    <div className="header">
      <span className="title">Month {props.monthlyWage.month}/{props.monthlyWage.year}</span>
      <span className="regular">Regular</span>
      <span className="evening">Evening</span>
      <span className="overtime">Overtime</span>
      <span className="total">Total</span>
    </div>

    <div>{ persons }</div>
  </div>
}
