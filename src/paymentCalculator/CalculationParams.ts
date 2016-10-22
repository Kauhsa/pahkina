import * as Big from 'big.js';
import Time from '../Time';

/**
 * Parameters used for calculation.
 */
export type CalculationParams = {
  readonly regularDailyWage: BigJsLibrary.BigJS;

  readonly eveningWorkParameters: {
    readonly extraWage: BigJsLibrary.BigJS;
    readonly start: Time;
    readonly end: Time;
  }

  readonly overtimeParameters: {
    readonly multiplier: BigJsLibrary.BigJS;
    readonly start: number;
    readonly end: number;
  }[];
}

export const DEFAULT_PARAMS: CalculationParams = {
  regularDailyWage: new Big("3.75"),

  eveningWorkParameters: {
    extraWage: new Big("1.15"),
    start: new Time(16, 0),
    end: new Time(8, 0)
  },

  overtimeParameters: [
    {
      start: 8,
      end: 10,
      multiplier: new Big("0.25")
    },
    {
      start: 10,
      end: 12,
      multiplier: new Big("0.5")
    },
    {
      start: 12,
      end: Infinity,
      multiplier: new Big("1")
    }
  ]
}
