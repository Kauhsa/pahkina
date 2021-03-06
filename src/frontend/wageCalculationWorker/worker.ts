/*
 * General note: Workers need to be in their own JS files, so import this with
 * Webpack worker-loader which handles everything correctly for you.
 */

import registerPromiseWorker = require('promise-worker/register');
import { DEFAULT_PARAMS } from '../../paymentCalculator/CalculationParams';
import calculateWage from '../../paymentCalculator/calculateWage';
import parseHourEntryCSV from '../../hourEntry/parseHourEntryCSV';
import { WorkerResult } from './wageCalculationWorker';

registerPromiseWorker((csv: string): WorkerResult => {
  const parsedCSV = parseHourEntryCSV(csv);

  if (parsedCSV.hasErrors()) {
    return {
      errors: parsedCSV.errors,
      monthlyWages: null
    }
  } else {
    return {
      errors: null,
      monthlyWages: calculateWage(parsedCSV.entries, DEFAULT_PARAMS)
    }
  }
})
