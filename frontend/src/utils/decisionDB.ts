// CRUD operations for decisions store

import type { Decision } from '../types/experiment';
import { STORES, executeReadTransaction, executeReadArrayTransaction, executeWriteTransaction } from './db';
import { updatePair, checkAndUpdateSessionStatus } from './sessionDB';
import { validateInvestment, validateReturn, calculatePayouts } from '../game/trustGame';

export async function createDecision(
  decision: Omit<Decision, 'id' | 'timestamp'>
): Promise<string> {
  const id = crypto.randomUUID();
  const timestamp = Date.now();

  const fullDecision: Decision = {
    ...decision,
    id,
    timestamp,
  };

  await executeWriteTransaction(
    STORES.DECISIONS,
    (store) => store.add(fullDecision)
  );

  return id;
}

export async function getDecision(id: string): Promise<Decision | undefined> {
  return executeReadTransaction<Decision>(
    STORES.DECISIONS,
    (store) => store.get(id)
  );
}

export async function getSessionDecisions(sessionId: string): Promise<Decision[]> {
  return executeReadArrayTransaction<Decision>(
    STORES.DECISIONS,
    (store) => store.index('sessionId').getAll(sessionId)
  );
}

export async function getPairDecisions(pairId: string): Promise<Decision[]> {
  return executeReadArrayTransaction<Decision>(
    STORES.DECISIONS,
    (store) => store.index('pairId').getAll(pairId)
  );
}

export async function getSubjectDecisions(subjectId: string): Promise<Decision[]> {
  return executeReadArrayTransaction<Decision>(
    STORES.DECISIONS,
    (store) => store.index('subjectId').getAll(subjectId)
  );
}

export async function deleteDecision(id: string): Promise<void> {
  await executeWriteTransaction(
    STORES.DECISIONS,
    (store) => store.delete(id)
  );
}

export async function submitInvestorDecision(
  sessionId: string,
  pairId: string,
  subjectId: string,
  investment: number,
  E1: number,
  UNIT: number
): Promise<void> {
  // Validate investment
  if (!validateInvestment(investment, E1, UNIT)) {
    throw new Error('Invalid investment amount');
  }

  // Create decision record
  await createDecision({
    sessionId,
    pairId,
    subjectId,
    role: 's1',
    decision: investment,
  });

  // Update pair with investment and change phase
  await updatePair(sessionId, pairId, {
    s_invested: investment,
    phase: 'waiting_s2',
  });
}

export async function submitTrusteeDecision(
  sessionId: string,
  pairId: string,
  subjectId: string,
  returnAmount: number,
  received: number,
  E1: number,
  E2: number,
  m: number,
  s_invested: number,
  UNIT: number
): Promise<void> {
  // Validate return
  if (!validateReturn(returnAmount, received, UNIT)) {
    throw new Error('Invalid return amount');
  }

  // Create decision record
  await createDecision({
    sessionId,
    pairId,
    subjectId,
    role: 's2',
    decision: returnAmount,
  });

  // Calculate final payouts
  const { s1_payout, s2_payout } = calculatePayouts(E1, E2, m, s_invested, returnAmount);

  // Update pair with return, payouts, and mark as completed
  await updatePair(sessionId, pairId, {
    r_returned: returnAmount,
    s1_payout,
    s2_payout,
    phase: 'completed',
    completedAt: Date.now(),
  });

  // Check if all pairs in the session are completed, and if so, mark session as completed
  await checkAndUpdateSessionStatus(sessionId);
}