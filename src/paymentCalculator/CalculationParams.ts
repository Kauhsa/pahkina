import * as Big from 'big.js';
import Time from '../Time';

/**
 * Parameters used for wage calculation.
 */
export type CalculationParams = {
  /**
   * Normal daily wage.
   */
  readonly regularDailyWage: BigJsLibrary.BigJS;

  /**
   * Evening work parameters. Start and end are hours on a day, which represent
   * the period when evening wage should be awarded. Both start-before-end
   * (8:00-16:00) and end-before-start (16:00-8:00) declarations are supported.
   *
   * extraWage should *not* contain the regular wage part, only the extra that
   * is given from evening work.
   */
  readonly eveningWorkParameters: {
    readonly extraWage: BigJsLibrary.BigJS;
    readonly start: Time;
    readonly end: Time;
  }

  /**
   * List of overtime parameters. Start and end are number of hours which after
   * overtime should be awarded – for example, work between 8 and 10 hours. You
   * can use Infinity on end, if you don't want an upper limit. Nothing is done
   * to fix overlapping start and end.
   *
   * Multiplier refers the additional money that is given on top of regular wage.
   * Multiplier is multiplied with regular wage and _then_ added on top of the
   * regular wage, so if you want double wage from some time period, you need
   * multiplier "1".
   */
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
