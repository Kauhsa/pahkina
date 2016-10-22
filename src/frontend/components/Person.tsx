import * as React from "react";
import * as Collapse from "react-collapse";
import { PersonWageInfo } from "../../paymentCalculator/calculateWage";

type PersonProps = {
  personWages: PersonWageInfo;
}

type PersonState = {
  open: boolean
}

export default class Person extends React.Component<PersonProps, PersonState> {
  constructor() {
    super()
    this.state = { open: false }
  }

  onPersonRowClick = () => {
    this.setState({ open: !this.state.open })
  }

  renderDayRows = () => {
    return this.props.personWages.dailyWages.map((dailyWage) =>
      <div className="dayRow">
        <span className="date">{dailyWage.date}</span>
        <span className="regular">{dailyWage.wages.regular}</span>
        <span className="evening">{dailyWage.wages.evening}</span>
        <span className="overtime">{dailyWage.wages.overtime}</span>
        <span className="total">{dailyWage.wages.total}</span>
      </div>
    )
  }

  render() {
    return <div className="person" key={this.props.personWages.id}>
      <div className="personRow" onClick={this.onPersonRowClick}>
        <span className="name">{this.props.personWages.name}</span>
        <span className="regular">{this.props.personWages.monthlyWages.regular}</span>
        <span className="evening">{this.props.personWages.monthlyWages.evening}</span>
        <span className="overtime">{this.props.personWages.monthlyWages.overtime}</span>
        <span className="total">{this.props.personWages.monthlyWages.total}</span>
      </div>

      <Collapse isOpened={this.state.open}>
        <div className="dayRows">
          { this.renderDayRows() }
        </div>
      </Collapse>
    </div>
  }
}
