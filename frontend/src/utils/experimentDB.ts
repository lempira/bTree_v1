// CRUD operations for experiments store

import type { Experiment } from '../types/experiment';
import { STORES, executeReadTransaction, executeReadArrayTransaction, executeWriteTransaction } from './db';
import { getSession } from './sessionDB';

export async function createExperiment(
  experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();

  const fullExperiment: Experiment = {
    ...experiment,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await executeWriteTransaction(
    STORES.EXPERIMENTS,
    (store) => store.add(fullExperiment)
  );

  return id;
}

export async function getExperiment(id: string): Promise<Experiment | undefined> {
  return executeReadTransaction<Experiment>(
    STORES.EXPERIMENTS,
    (store) => store.get(id)
  );
}

export async function getExperimenterExperiments(createdBy: string): Promise<Experiment[]> {
  return executeReadArrayTransaction<Experiment>(
    STORES.EXPERIMENTS,
    (store) => store.index('createdBy').getAll(createdBy)
  );
}

export async function updateExperiment(
  id: string,
  updates: Partial<Omit<Experiment, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const existing = await getExperiment(id);

  if (!existing) {
    throw new Error(`Experiment ${id} not found`);
  }

  const updated: Experiment = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await executeWriteTransaction(
    STORES.EXPERIMENTS,
    (store) => store.put(updated)
  );
}

export async function deleteExperiment(id: string): Promise<void> {
  await executeWriteTransaction(
    STORES.EXPERIMENTS,
    (store) => store.delete(id)
  );
}

export async function getExperimentForSession(sessionId: string): Promise<Experiment | undefined> {
  const session = await getSession(sessionId);

  if (!session) {
    return undefined;
  }

  return getExperiment(session.experimentId);
}