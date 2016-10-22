import { DEFAULT_PARAMS } from '../../paymentCalculator/CalculationParams';
import calculateWage from '../../paymentCalculator/calculateWage';
import parseHourEntryCSV from '../../hourEntry/parseHourEntryCSV';
import registerPromiseWorker = require('promise-worker/register');
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
