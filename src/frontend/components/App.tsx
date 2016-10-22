import 'core-js';
import * as React from "react";
import parseHourEntryCSV from '../../hourEntry/parseHourEntryCSV';
import Wages from './Wages';
import Editor from './Editor';
import Errors from './Errors';
import wageCalculationWorker, { WorkerResult } from '../wageCalculationWorker/wageCalculationWorker';
import INITIAL_INPUT from '../initialInput';

type AppState = {
  input: string,
  workerResult: WorkerResult
}

export default class App extends React.Component<{}, AppState> {
  constructor() {
    super();
    this.state = {
      input: INITIAL_INPUT,
      workerResult: { monthlyWages: null, errors: null }
    }
    this.initCalculatingWages();
  }

  initCalculatingWages = () => {
    wageCalculationWorker(this.state.input).then((result) => {
      this.setState((oldState) => Object.assign(oldState, { workerResult: result }))
    })
  }

  onTextAreaChanged = (newValue) => {
    this.setState((oldState) => Object.assign({input: newValue}))
    this.initCalculatingWages();
  }

  renderOutputElement = () => {
    const workerResult = this.state.workerResult;

    if (workerResult.monthlyWages !== null) {
      return <Wages monthlyWages={workerResult.monthlyWages} />
    } else if (workerResult.errors !== null) {
      return <Errors errors={workerResult.errors} />
    } else {
      return null;
    }
  }

  render() {
    return <div className="app">
      <header>
        <h1>Money, yo</h1>
      </header>

      <section className="input">
        <h2>Put your data here</h2>
        <Editor
          onChange={this.onTextAreaChanged}
          value={this.state.input}
          workerResult={this.state.workerResult}/>
      </section>

      <section className="output">
        {this.renderOutputElement()}
      </section>
    </div>
  }
}
