// CRUD operations for sessions store

import type { Session, SessionPair } from '../types/experiment';
import { STORES, executeReadTransaction, executeReadArrayTransaction, executeWriteTransaction } from './db';

export async function createSession(
  session: Omit<Session, 'id' | 'createdAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();

  const fullSession: Session = {
    ...session,
    id,
    createdAt: now,
  };

  await executeWriteTransaction(
    STORES.SESSIONS,
    (store) => store.add(fullSession)
  );

  return id;
}

export async function getSession(id: string): Promise<Session | undefined> {
  return executeReadTransaction<Session>(
    STORES.SESSIONS,
    (store) => store.get(id)
  );
}

export async function getExperimentSessions(experimentId: string): Promise<Session[]> {
  return executeReadArrayTransaction<Session>(
    STORES.SESSIONS,
    (store) => store.index('experimentId').getAll(experimentId)
  );
}

export async function updateSession(
  id: string,
  updates: Partial<Omit<Session, 'id' | 'createdAt' | 'createdBy' | 'experimentId'>>
): Promise<void> {
  const existing = await getSession(id);

  if (!existing) {
    throw new Error(`Session ${id} not found`);
  }

  const updated: Session = {
    ...existing,
    ...updates,
  };

  await executeWriteTransaction(
    STORES.SESSIONS,
    (store) => store.put(updated)
  );
}

export async function updatePair(
  sessionId: string,
  pairId: string,
  updates: Partial<SessionPair>
): Promise<void> {
  const session = await getSession(sessionId);

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const pairIndex = session.pairs.findIndex(p => p.pairId === pairId);

  if (pairIndex === -1) {
    throw new Error(`Pair ${pairId} not found in session ${sessionId}`);
  }

  session.pairs[pairIndex] = {
    ...session.pairs[pairIndex],
    ...updates,
  };

  await updateSession(sessionId, { pairs: session.pairs });
}

export async function deleteSession(id: string): Promise<void> {
  await executeWriteTransaction(
    STORES.SESSIONS,
    (store) => store.delete(id)
  );
}

export async function findSubjectPair(
  sessionId: string,
  subjectId: string
): Promise<{ pair: SessionPair; role: 's1' | 's2' } | null> {
  const session = await getSession(sessionId);

  if (!session) {
    return null;
  }

  for (const pair of session.pairs) {
    if (pair.s1_id === subjectId) {
      return { pair, role: 's1' };
    }
    if (pair.s2_id === subjectId) {
      return { pair, role: 's2' };
    }
  }

  return null;
}

export async function getAllSessions(): Promise<Session[]> {
  return executeReadArrayTransaction<Session>(
    STORES.SESSIONS,
    (store) => store.getAll()
  );
}

export async function findSessionsForSubject(subjectId: string): Promise<Session[]> {
  const allSessions = await getAllSessions();

  // Filter sessions where the subject appears in any pair (as s1_id or s2_id)
  return allSessions.filter(session =>
    session.pairs.some(pair => pair.s1_id === subjectId || pair.s2_id === subjectId)
  );
}

/**
 * Check if all pairs in a session are completed, and if so, update session status to 'completed'
 */
export async function checkAndUpdateSessionStatus(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  // Check if all pairs are completed
  const allPairsCompleted = session.pairs.every(pair => pair.phase === 'completed');

  // If all pairs are completed and session is still active, mark session as completed
  if (allPairsCompleted && session.status === 'active') {
    await updateSession(sessionId, { status: 'completed' });
  }
}