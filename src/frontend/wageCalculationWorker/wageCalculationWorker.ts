import PromiseWorker = require('promise-worker');
import Worker = require('worker!./worker')

import { MonthWageInfo } from '../../paymentCalculator/calculateWage';
import { ParseErrorOnRow } from '../../hourEntry/parseHourEntryCSV';

const worker = new Worker();
const promiseWorker = new PromiseWorker(worker);

export type WorkerResult = {
  errors: ParseErrorOnRow[];
  monthlyWages: MonthWageInfo[];
}

export default function(csv: string): PromiseLike<WorkerResult> {
  return promiseWorker.postMessage(csv);
}
