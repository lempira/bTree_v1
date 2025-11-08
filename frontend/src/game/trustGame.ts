// Trust Game calculation and validation logic

/**
 * Calculate the refund S1 receives after investing
 * @param E1 - S1's initial endowment
 * @param s - Amount S1 invested
 * @returns Refund amount (E1 - s)
 */
export function calculateInvestorRefund(E1: number, s: number): number {
  return E1 - s;
}

/**
 * Calculate the amount S2 receives after S1's investment is multiplied
 * @param s - Amount S1 invested
 * @param m - Multiplier
 * @returns Amount S2 receives (s × m)
 */
export function calculateTrusteeReceived(s: number, m: number): number {
  return s * m;
}

/**
 * Calculate final payouts for both players
 * @param E1 - S1's initial endowment
 * @param E2 - S2's initial endowment
 * @param m - Multiplier
 * @param s - Amount S1 invested
 * @param r - Amount S2 returned to S1
 * @returns Object with s1_payout and s2_payout
 */
export function calculatePayouts(
  E1: number,
  E2: number,
  m: number,
  s: number,
  r: number
): { s1_payout: number; s2_payout: number } {
  const received = s * m;
  const s1_payout = (E1 - s) + r;
  const s2_payout = E2 + (received - r);

  return { s1_payout, s2_payout };
}

/**
 * Validate S1's investment decision
 * @param s - Amount S1 wants to invest
 * @param E1 - S1's initial endowment
 * @param UNIT - Step size for decisions
 * @returns true if valid, false otherwise
 */
export function validateInvestment(s: number, E1: number, UNIT: number): boolean {
  // Must be non-negative
  if (s < 0) return false;

  // Must not exceed endowment
  if (s > E1) return false;

  // Must be a multiple of UNIT
  if (s % UNIT !== 0) return false;

  return true;
}

/**
 * Validate S2's return decision
 * @param r - Amount S2 wants to return
 * @param received - Amount S2 received (s × m)
 * @param UNIT - Step size for decisions
 * @returns true if valid, false otherwise
 */
export function validateReturn(r: number, received: number, UNIT: number): boolean {
  // Must be non-negative
  if (r < 0) return false;

  // Must not exceed received amount
  if (r > received) return false;

  // Must be a multiple of UNIT
  if (r % UNIT !== 0) return false;

  return true;
}