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

/**
 * Do a CSV parsing and wage calculation in a separate thread.
 */
export default function(csv: string): PromiseLike<WorkerResult> {
  return promiseWorker.postMessage(csv);
}
