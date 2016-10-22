import * as React from "react";
import { WorkerResult } from '../wageCalculationWorker/wageCalculationWorker';
import AceEditor from 'react-ace';

type EditorProps = {
  value: string;
  workerResult: WorkerResult;
  onChange: (newValue) => void
}

function getAnnotations(workerResult: WorkerResult) {
  if (!workerResult.errors) {
    return [];
  }

  return workerResult.errors.map((errorOnRow) => ({
    row: errorOnRow.row,
    column: 1,
    type: 'error',
    text: errorOnRow.error.message
  }))
}

export default (props: EditorProps) =>
  <AceEditor
    fontSize={15}
    height="200px"
    width="100%"
    annotations={getAnnotations(props.workerResult)}
    value={props.value}
    onChange={props.onChange} />
