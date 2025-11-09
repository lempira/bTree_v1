// CRUD operations for subjects store

import type { Subject } from '../types/experiment';
import { initDB, STORES } from './db';

export async function createSubject(
  subject: Omit<Subject, 'createdAt'>
): Promise<string> {
  const db = await initDB();
  const now = Date.now();

  const fullSubject: Subject = {
    ...subject,
    createdAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SUBJECTS], 'readwrite');
    const store = transaction.objectStore(STORES.SUBJECTS);
    const request = store.add(fullSubject);

    request.onsuccess = () => resolve(subject.id);
    request.onerror = () => reject(request.error);
  });
}

export async function getSubject(id: string): Promise<Subject | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SUBJECTS], 'readonly');
    const store = transaction.objectStore(STORES.SUBJECTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllSubjects(): Promise<Subject[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SUBJECTS], 'readonly');
    const store = transaction.objectStore(STORES.SUBJECTS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function updateSubject(
  id: string,
  updates: Partial<Omit<Subject, 'id' | 'createdAt' | 'account'>>
): Promise<void> {
  const db = await initDB();
  const existing = await getSubject(id);

  if (!existing) {
    throw new Error(`Subject ${id} not found`);
  }

  const updated: Subject = {
    ...existing,
    ...updates,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SUBJECTS], 'readwrite');
    const store = transaction.objectStore(STORES.SUBJECTS);
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSubject(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SUBJECTS], 'readwrite');
    const store = transaction.objectStore(STORES.SUBJECTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
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