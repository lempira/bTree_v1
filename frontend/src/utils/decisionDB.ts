// CRUD operations for decisions store

import type { Decision } from '../types/experiment';
import { initDB, STORES } from './db';
import { updatePair } from './sessionDB';
import { validateInvestment } from '../game/trustGame';

export async function createDecision(
  decision: Omit<Decision, 'id' | 'timestamp'>
): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  const timestamp = Date.now();

  const fullDecision: Decision = {
    ...decision,
    id,
    timestamp,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DECISIONS], 'readwrite');
    const store = transaction.objectStore(STORES.DECISIONS);
    const request = store.add(fullDecision);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getDecision(id: string): Promise<Decision | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DECISIONS], 'readonly');
    const store = transaction.objectStore(STORES.DECISIONS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSessionDecisions(sessionId: string): Promise<Decision[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DECISIONS], 'readonly');
    const store = transaction.objectStore(STORES.DECISIONS);
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getPairDecisions(pairId: string): Promise<Decision[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DECISIONS], 'readonly');
    const store = transaction.objectStore(STORES.DECISIONS);
    const index = store.index('pairId');
    const request = index.getAll(pairId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getSubjectDecisions(subjectId: string): Promise<Decision[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DECISIONS], 'readonly');
    const store = transaction.objectStore(STORES.DECISIONS);
    const index = store.index('subjectId');
    const request = index.getAll(subjectId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDecision(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DECISIONS], 'readwrite');
    const store = transaction.objectStore(STORES.DECISIONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
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