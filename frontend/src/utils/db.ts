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
  if (dbInstance) {
    console.log('[DB] Using cached database instance');
    return dbInstance;
  }

  console.log('[DB] Opening database:', DB_NAME, 'version:', DB_VERSION);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    let isResolved = false;

    request.onerror = () => {
      console.error('[DB] Error opening database:', request.error);
      if (!isResolved) {
        isResolved = true;
        reject(request.error);
      }
    };

    request.onsuccess = () => {
      console.log('[DB] Database opened successfully');
      dbInstance = request.result;

      // Log available stores
      console.log('[DB] Available stores:', Array.from(dbInstance.objectStoreNames));

      if (!isResolved) {
        isResolved = true;
        resolve(request.result);
      }
    };

    request.onblocked = (event) => {
      console.error('[DB] Database open BLOCKED! Close all other tabs or wait for pending operations.');
      console.error('[DB] Blocked event:', event);
      // Don't resolve or reject - let it actually block to show the problem
    };

    // Add a timeout for debugging
    setTimeout(() => {
      if (!isResolved) {
        console.error('[DB] Database open timed out after 10 seconds - likely blocked by another connection');
        console.error('[DB] Try closing all tabs and reopening, or manually delete the database via DevTools > Application > IndexedDB');
      }
    }, 10000);

    request.onupgradeneeded = (event) => {
      console.log('[DB] Upgrading database schema');
      const db = (event.target as IDBOpenDBRequest).result;

      // Experiments store
      if (!db.objectStoreNames.contains(STORES.EXPERIMENTS)) {
        console.log('[DB] Creating experiments store');
        const experimentsStore = db.createObjectStore(STORES.EXPERIMENTS, { keyPath: 'id' });
        experimentsStore.createIndex('createdBy', 'createdBy', { unique: false });
        experimentsStore.createIndex('type', 'type', { unique: false });
        experimentsStore.createIndex('status', 'status', { unique: false });
      }

      // Sessions store
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        console.log('[DB] Creating sessions store');
        const sessionsStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
        sessionsStore.createIndex('experimentId', 'experimentId', { unique: false });
        sessionsStore.createIndex('createdBy', 'createdBy', { unique: false });
        sessionsStore.createIndex('status', 'status', { unique: false });
      }

      // Decisions store
      if (!db.objectStoreNames.contains(STORES.DECISIONS)) {
        console.log('[DB] Creating decisions store');
        const decisionsStore = db.createObjectStore(STORES.DECISIONS, { keyPath: 'id' });
        decisionsStore.createIndex('sessionId', 'sessionId', { unique: false });
        decisionsStore.createIndex('pairId', 'pairId', { unique: false });
        decisionsStore.createIndex('subjectId', 'subjectId', { unique: false });
      }

      // Subjects store
      if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
        console.log('[DB] Creating subjects store');
        const subjectsStore = db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id' });
        subjectsStore.createIndex('alias', 'alias', { unique: false });
        subjectsStore.createIndex('createdAt', 'createdAt', { unique: false });
        subjectsStore.createIndex('lastParticipated', 'lastParticipated', { unique: false });
      }
    };
  });
}

/**
 * Clear the cached database instance. Call this after deleting the database.
 */
export function clearDBInstance(): void {
  if (dbInstance) {
    console.log('[DB] Closing and clearing database instance');
    dbInstance.close();
    dbInstance = null;
  } else {
    console.log('[DB] No database instance to clear');
  }
}

/**
 * Execute a read transaction that returns a single value or undefined.
 * Properly waits for transaction completion before resolving.
 */
export async function executeReadTransaction<T>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest<T | undefined>
): Promise<T | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    let result: T | undefined;

    request.onsuccess = () => {
      result = request.result;
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
      dbInstance = null;
      resolve(result);
    };

    transaction.onerror = () => {
      db.close();
      dbInstance = null;
      reject(transaction.error);
    };
  });
}

/**
 * Execute a read transaction that returns an array.
 * Properly waits for transaction completion before resolving.
 */
export async function executeReadArrayTransaction<T>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest<T[]>
): Promise<T[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    let result: T[] = [];

    request.onsuccess = () => {
      result = request.result || [];
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
      dbInstance = null;
      resolve(result);
    };

    transaction.onerror = () => {
      db.close();
      dbInstance = null;
      reject(transaction.error);
    };
  });
}

/**
 * Execute a write transaction (add, put, delete).
 * Properly waits for transaction completion before resolving.
 * Returns the result from the request (useful for add operations that return the key).
 */
export async function executeWriteTransaction<T = void>(
  storeName: string,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    let result: T;

    request.onsuccess = () => {
      result = request.result;
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
      dbInstance = null;
      resolve(result);
    };

    transaction.onerror = () => {
      db.close();
      dbInstance = null;
      reject(transaction.error);
    };
  });
}