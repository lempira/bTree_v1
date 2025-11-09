// CRUD operations for sessions store

import type { Session, SessionPair } from '../types/experiment';
import { initDB, STORES } from './db';

export async function createSession(
  session: Omit<Session, 'id' | 'createdAt'>
): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  const now = Date.now();

  const fullSession: Session = {
    ...session,
    id,
    createdAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.SESSIONS);
    const request = store.add(fullSession);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readonly');
    const store = transaction.objectStore(STORES.SESSIONS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getExperimentSessions(experimentId: string): Promise<Session[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readonly');
    const store = transaction.objectStore(STORES.SESSIONS);
    const index = store.index('experimentId');
    const request = index.getAll(experimentId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function updateSession(
  id: string,
  updates: Partial<Omit<Session, 'id' | 'createdAt' | 'createdBy' | 'experimentId'>>
): Promise<void> {
  const db = await initDB();
  const existing = await getSession(id);

  if (!existing) {
    throw new Error(`Session ${id} not found`);
  }

  const updated: Session = {
    ...existing,
    ...updates,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.SESSIONS);
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
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
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readwrite');
    const store = transaction.objectStore(STORES.SESSIONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
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
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], 'readonly');
    const store = transaction.objectStore(STORES.SESSIONS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function findSessionsForSubject(subjectId: string): Promise<Session[]> {
  const allSessions = await getAllSessions();

  // Filter sessions where the subject appears in any pair (as s1_id or s2_id)
  return allSessions.filter(session =>
    session.pairs.some(pair => pair.s1_id === subjectId || pair.s2_id === subjectId)
  );
}