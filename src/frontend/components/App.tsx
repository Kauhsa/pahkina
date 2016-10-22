import * as React from "react";
import AceEditor from 'react-ace';
import parseHourEntryCSV from '../../hourEntry/parseHourEntryCSV';
import Wages from '../components/Wages';

type AppState = {
  input: string
}

const INITIAL_INPUT = `
Scott Scala,2,2.3.2014,6:00,14:00
Janet Java,1,3.3.2014,9:30,17:00
Scott Scala,2,3.3.2014,8:15,16:00
Larry Lolcode,3,3.3.2014,18:00,19:00
Janet Java,1,4.3.2014,9:45,16:30
Scott Scala,2,4.3.2014,8:30,16:30
Janet Java,1,5.3.2014,8:00,16:30
Scott Scala,2,5.3.2014,9:00,17:00
Janet Java,1,6.3.2014,8:00,12:00
Janet Java,1,6.3.2014,16:00,22:00
Scott Scala,2,6.3.2014,8:15,17:00
Larry Lolcode,3,6.3.2014,5:00,10:00
Janet Java,1,7.3.2014,9:00,17:00
Scott Scala,2,7.3.2014,8:15,17:00
Larry Lolcode,3,7.3.2014,5:00,10:00
Scott Scala,2,9.3.2014,14:00,16:00
Janet Java,1,10.3.2014,8:45,16:45
Scott Scala,2,10.3.2014,8:15,16:15
Scott Scala,2,10.3.2014,22:00,23:00
Larry Lolcode,3,10.3.2014,8:00,16:00
Janet Java,1,11.3.2014,9:00,17:30
Scott Scala,2,11.3.2014,8:30,17:00
Janet Java,1,12.3.2014,16:00,2:00
Scott Scala,2,12.3.2014,9:00,17:30
Larry Lolcode,3,12.3.2014,12:30,12:45
Janet Java,1,13.3.2014,10:00,15:00
Scott Scala,2,13.3.2014,14:00,1:15
Larry Lolcode,3,13.3.2014,10:00,11:00
Janet Java,1,14.3.2014,9:00,17:00
Scott Scala,2,14.3.2014,9:30,17:00
Larry Lolcode,3,14.3.2014,8:45,15:45
Larry Lolcode,3,15.3.2014,9:00,10:15
Larry Lolcode,3,15.3.2014,12:30,13:15
Larry Lolcode,3,15.3.2014,15:30,17:15
Janet Java,1,16.3.2014,8:00,22:00
Janet Java,1,17.3.2014,8:45,16:45
Scott Scala,2,17.3.2014,8:30,16:30
Larry Lolcode,3,17.3.2014,8:30,15:30
Janet Java,1,18.3.2014,9:30,16:30
Scott Scala,2,18.3.2014,8:30,16:30
Larry Lolcode,3,18.3.2014,9:00,15:45
Janet Java,1,19.3.2014,9:30,16:30
Scott Scala,2,19.3.2014,12:00,14:00
Larry Lolcode,3,19.3.2014,8:30,15:45
Janet Java,1,20.3.2014,2:00,6:00
Janet Java,1,20.3.2014,10:00,19:00
Scott Scala,2,20.3.2014,12:00,14:00
Larry Lolcode,3,20.3.2014,1:00,3:00
Janet Java,1,21.3.2014,8:15,16:15
Scott Scala,2,21.3.2014,10:00,18:00
Larry Lolcode,3,21.3.2014,6:00,17:00
Scott Scala,2,23.3.2014,14:00,14:30
Scott Scala,2,23.3.2014,15:00,15:15
Janet Java,1,24.3.2014,8:45,16:30
Scott Scala,2,24.3.2014,22:00,6:00
Janet Java,1,25.3.2014,9:30,18:30
Scott Scala,2,25.3.2014,9:30,17:30
Larry Lolcode,3,25.3.2014,9:00,16:00
Janet Java,1,26.3.2014,9:30,16:45
Scott Scala,2,26.3.2014,10:00,18:00
Larry Lolcode,3,26.3.2014,9:30,17:00
Janet Java,1,27.3.2014,9:00,16:45
Scott Scala,2,27.3.2014,9:00,17:00
Janet Java,1,28.3.2014,10:00,14:00
Scott Scala,2,28.3.2014,8:30,19:00
Larry Lolcode,3,28.3.2014,6:00,16:00
Larry Lolcode,3,30.3.2014,8:00,16:00
`.trim()

export default class App extends React.Component<{}, AppState> {
  constructor() {
    super();
    this.state = {
      input: INITIAL_INPUT
    }
  }

  onTextAreaChanged = (newValue) => {
    this.setState({input: newValue})
  }

  parseState = () => {
    return parseHourEntryCSV(this.state.input);
  }

  renderOutputElement = () => {
    const state = this.parseState();

    if (!state.hasErrors()) {
      console.log(state.entries)
      return <Wages entries={state.entries} />
    } else {
      const errorList = state.errors.map((errorOnRow, i) =>
        <div key={i}>Error on row {errorOnRow.row}: "{errorOnRow.error.message}"</div>
      );

      return <div>
        <h2>Errors</h2>
        { errorList }
      </div>
    }
  }

  getErrorAnnotations = () => {
    const state = this.parseState();

    if (state.hasErrors()) {
      return state.errors.map((errorOnRow) => ({
        row: errorOnRow.row,
        column: 1,
        type: 'error',
        text: errorOnRow.error.message
      }))
    } else {
      return []
    }
  }

  render() {
    return <div className="app">
      <header>
        <h1>Money, yo</h1>
      </header>

      <section className="input">
        <h2>Hours data</h2>
        <AceEditor
          fontSize="20"
          height="200px"
          width="100%"
          theme="github"
          annotations={this.getErrorAnnotations()}
          value={this.state.input}
          onChange={this.onTextAreaChanged} />
      </section>

      <section className="output">
        {this.renderOutputElement()}
      </section>
    </div>
  }
}
