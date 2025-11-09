// Shared IndexedDB initialization for experiment data
// Database: btree_experiments
// Stores: experiments, sessions, decisions, subjects

const DB_NAME = 'btree_experiments';
const DB_VERSION = 1;

export const STORES = {
  EXPERIMENTS: 'experiments',
  SESSIONS: 'sessions',
  DECISIONS: 'decisions',
  SUBJECTS: 'subjects',
} as const;

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Experiments store
      if (!db.objectStoreNames.contains(STORES.EXPERIMENTS)) {
        const experimentsStore = db.createObjectStore(STORES.EXPERIMENTS, { keyPath: 'id' });
        experimentsStore.createIndex('createdBy', 'createdBy', { unique: false });
        experimentsStore.createIndex('type', 'type', { unique: false });
        experimentsStore.createIndex('status', 'status', { unique: false });
      }

      // Sessions store
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        const sessionsStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
        sessionsStore.createIndex('experimentId', 'experimentId', { unique: false });
        sessionsStore.createIndex('createdBy', 'createdBy', { unique: false });
        sessionsStore.createIndex('status', 'status', { unique: false });
      }

      // Decisions store
      if (!db.objectStoreNames.contains(STORES.DECISIONS)) {
        const decisionsStore = db.createObjectStore(STORES.DECISIONS, { keyPath: 'id' });
        decisionsStore.createIndex('sessionId', 'sessionId', { unique: false });
        decisionsStore.createIndex('pairId', 'pairId', { unique: false });
        decisionsStore.createIndex('subjectId', 'subjectId', { unique: false });
      }

      // Subjects store
      if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
        const subjectsStore = db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id' });
        subjectsStore.createIndex('alias', 'alias', { unique: false });
        subjectsStore.createIndex('createdAt', 'createdAt', { unique: false });
        subjectsStore.createIndex('lastParticipated', 'lastParticipated', { unique: false });
      }
    };
  });
}