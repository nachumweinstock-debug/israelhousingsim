/**
 * Standard equal-installment (Spitzer / "shpitzer") amortization — the
 * baseline every track's payment calculation builds on before indexation
 * or rate-reset behavior is layered on top.
 */

/** Monthly payment for a fully-amortizing loan at a fixed monthly rate. */
export function spitzerPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (termMonths <= 0 || principal <= 0) return 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const factor = Math.pow(1 + monthlyRate, -termMonths);
  return (principal * monthlyRate) / (1 - factor);
}

/** Remaining principal balance after `paidMonths` of a Spitzer schedule. */
export function remainingBalance(
  principal: number,
  annualRate: number,
  termMonths: number,
  paidMonths: number
): number {
  if (paidMonths <= 0) return principal;
  if (paidMonths >= termMonths) return 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) {
    return principal * (1 - paidMonths / termMonths);
  }
  const payment = spitzerPayment(principal, annualRate, termMonths);
  const growth = Math.pow(1 + monthlyRate, paidMonths);
  return principal * growth - payment * ((growth - 1) / monthlyRate);
}

/** Total interest paid over `termMonths` at a constant monthly payment. */
export function totalInterestFlat(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const payment = spitzerPayment(principal, annualRate, termMonths);
  return payment * termMonths - principal;
}
