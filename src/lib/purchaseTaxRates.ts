/**
 * Israeli purchase tax (mas rechisha) brackets, marginal (each portion of
 * the price is taxed at its own bracket's rate, not the whole price at
 * the top rate that price reaches).
 *
 * Rates verified July 2026, frozen through 2028-01-15 per Israel's
 * Economic Arrangements Law (חוק ההסדרים). Re-verify against Israeli Tax
 * Authority (רשות המסים) publications before this date, the brackets are
 * scheduled to be reconsidered as part of the next Economic Arrangements
 * Law and may change.
 *
 * Cross-checked across six independent sources (law firm publications and
 * financial calculator sites) as of the verification date above; kept in
 * one file, separate from the calculation logic in mortgageMath.ts, so a
 * future rate update is a data change here, not a hunt through scattered
 * magic numbers.
 */

export interface TaxBracket {
  /** Upper bound of this bracket, in NIS. Infinity for the top bracket. */
  upTo: number;
  /** Marginal rate applied to the portion of the price inside this bracket. */
  rate: number;
}

/**
 * Single/only apartment (דירה יחידה), Israeli resident individual.
 */
export const SINGLE_HOME_BRACKETS: TaxBracket[] = [
  { upTo: 1_978_745, rate: 0 },
  { upTo: 2_347_040, rate: 0.035 },
  { upTo: 6_055_070, rate: 0.05 },
  { upTo: 20_183_565, rate: 0.08 },
  { upTo: Infinity, rate: 0.1 },
];

/**
 * Additional/investment apartment (דירה נוספת), taxed from the first
 * shekel with no 0% exemption bracket.
 */
export const INVESTMENT_BRACKETS: TaxBracket[] = [
  { upTo: 6_055_070, rate: 0.08 },
  { upTo: Infinity, rate: 0.1 },
];

/**
 * New immigrant (oleh chadash) rate, applies from one year before aliyah
 * through seven years after. No 0% floor bracket in the rate itself, the
 * calling code (estimatePurchaseTax in mortgageMath.ts) always takes the
 * better of this and the regular resident schedule, so the benefit can
 * never come out worse than paying as a regular resident, see that
 * function's docstring for the history of why that safety net exists.
 */
export const NEW_IMMIGRANT_BRACKETS: TaxBracket[] = [
  { upTo: 1_988_090, rate: 0.005 },
  { upTo: Infinity, rate: 0.05 },
];

/**
 * Not yet implemented: mas shevach (מס שבח, betterment tax owed on an
 * eventual sale) is a distinct tax from mas rechisha handled here, and is
 * a future feature for this simulator, not something this rates file or
 * estimatePurchaseTax covers. Flagging here so it isn't mistaken for an
 * oversight in the purchase-tax modeling.
 */
