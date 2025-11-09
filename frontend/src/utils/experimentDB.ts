// CRUD operations for experiments store

import type { Experiment } from '../types/experiment';
import { initDB, STORES } from './db';
import { getSession } from './sessionDB';

export async function createExperiment(
  experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = await initDB();
  const id = crypto.randomUUID();
  const now = Date.now();

  const fullExperiment: Experiment = {
    ...experiment,
    id,
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXPERIMENTS], 'readwrite');
    const store = transaction.objectStore(STORES.EXPERIMENTS);
    const request = store.add(fullExperiment);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getExperiment(id: string): Promise<Experiment | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXPERIMENTS], 'readonly');
    const store = transaction.objectStore(STORES.EXPERIMENTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getExperimenterExperiments(createdBy: string): Promise<Experiment[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXPERIMENTS], 'readonly');
    const store = transaction.objectStore(STORES.EXPERIMENTS);
    const index = store.index('createdBy');
    const request = index.getAll(createdBy);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function updateExperiment(
  id: string,
  updates: Partial<Omit<Experiment, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const db = await initDB();
  const existing = await getExperiment(id);

  if (!existing) {
    throw new Error(`Experiment ${id} not found`);
  }

  const updated: Experiment = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXPERIMENTS], 'readwrite');
    const store = transaction.objectStore(STORES.EXPERIMENTS);
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteExperiment(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.EXPERIMENTS], 'readwrite');
    const store = transaction.objectStore(STORES.EXPERIMENTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getExperimentForSession(sessionId: string): Promise<Experiment | undefined> {
  const session = await getSession(sessionId);

  if (!session) {
    return undefined;
  }

  return getExperiment(session.experimentId);
}