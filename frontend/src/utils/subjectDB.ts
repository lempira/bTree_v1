// CRUD operations for subjects store

import type { Subject } from '../types/experiment';
import { STORES, executeReadTransaction, executeReadArrayTransaction, executeWriteTransaction } from './db';

export async function createSubject(
  subject: Omit<Subject, 'createdAt'>
): Promise<string> {
  const now = Date.now();

  const fullSubject: Subject = {
    ...subject,
    createdAt: now,
  };

  await executeWriteTransaction(
    STORES.SUBJECTS,
    (store) => store.add(fullSubject)
  );

  return subject.id;
}

export async function getSubject(id: string): Promise<Subject | undefined> {
  return executeReadTransaction<Subject>(
    STORES.SUBJECTS,
    (store) => store.get(id)
  );
}

export async function getAllSubjects(): Promise<Subject[]> {
  return executeReadArrayTransaction<Subject>(
    STORES.SUBJECTS,
    (store) => store.getAll()
  );
}

export async function updateSubject(
  id: string,
  updates: Partial<Omit<Subject, 'id' | 'createdAt' | 'account'>>
): Promise<void> {
  const existing = await getSubject(id);

  if (!existing) {
    throw new Error(`Subject ${id} not found`);
  }

  const updated: Subject = {
    ...existing,
    ...updates,
  };

  await executeWriteTransaction(
    STORES.SUBJECTS,
    (store) => store.put(updated)
  );
}

export async function deleteSubject(id: string): Promise<void> {
  await executeWriteTransaction(
    STORES.SUBJECTS,
    (store) => store.delete(id)
  );
}

export async function upsertSubject(subject: Omit<Subject, 'createdAt'>): Promise<void> {
  const existing = await getSubject(subject.id);

  if (existing) {
    // Update existing subject's alias
    await updateSubject(subject.id, {
      alias: subject.alias,
    });
  } else {
    // Create new subject
    await createSubject(subject);
  }
}