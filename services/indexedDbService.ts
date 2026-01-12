
import { logger } from "./loggerService";
import { OfflineOperation } from "../types"; 

const DB_NAME = 'alshwaia_offline_db';
const DB_VERSION = 2; 
const STORE_NAME = 'offline_queue';
const DATA_STORE_NAME = 'cached_data'; 

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBOpenDBRequest;
      const dbInstance = target.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(DATA_STORE_NAME)) {
        dbInstance.createObjectStore(DATA_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const target = event.target as IDBOpenDBRequest;
      db = target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      const target = event.target as IDBOpenDBRequest;
      logger.error('IndexedDB error', target.error);
      reject(target.error);
    };
  });
}

export const indexedDbService = {
  async addOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp'>): Promise<OfflineOperation> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const newOperation: OfflineOperation = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...operation,
      };
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(newOperation);

      request.onsuccess = () => {
        logger.info(`Operation added to offline queue: ${newOperation.action} (ID: ${newOperation.id})`);
        resolve(newOperation);
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest;
        logger.error('Error adding operation to IndexedDB', target.error);
        reject(target.error);
      };
    });
  },

  async updateOfflineOperationPayload(id: string, newPayload: any): Promise<void> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const operation: OfflineOperation = getRequest.result;
        if (operation) {
          operation.payload = newPayload;
          const updateRequest = store.put(operation);
          updateRequest.onsuccess = () => {
            logger.info(`Operation payload updated in offline queue: ${id}`);
            resolve();
          };
          updateRequest.onerror = (event) => {
            const target = event.target as IDBRequest;
            logger.error(`Error updating operation payload ${id} in IndexedDB`, target.error);
            reject(target.error);
          };
        } else {
          reject(new Error(`Operation with ID ${id} not found.`));
        }
      };

      getRequest.onerror = (event) => {
        const target = event.target as IDBRequest;
        logger.error(`Error getting operation ${id} for update from IndexedDB`, target.error);
        reject(target.error);
      };
    });
  },

  async getAllOperations(): Promise<OfflineOperation[]> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as OfflineOperation[]);
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest;
        logger.error('Error getting all operations from IndexedDB', target.error);
        reject(target.error);
      };
    });
  },

  async removeOperation(id: string): Promise<void> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        logger.info(`Operation removed from offline queue: ${id}`);
        resolve();
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest;
        reject(target.error);
      };
    });
  },

  async getQueueCount(): Promise<number> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest;
        reject(target.error);
      };
    });
  },

  async saveData(id: string, data: any): Promise<void> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(DATA_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(DATA_STORE_NAME);
      const request = store.put({ id, data, timestamp: Date.now() });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest;
        reject(target.error);
      };
    });
  },

  async getData(id: string): Promise<any | null> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(DATA_STORE_NAME, 'readonly');
      const store = transaction.objectStore(DATA_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const record = request.result;
        // تقليل مدة الصلاحية لـ 10 دقائق فقط بدلاً من 24 ساعة لضمان حداثة البيانات
        if (record && (Date.now() - record.timestamp < 10 * 60 * 1000)) { 
          resolve(record.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest;
        reject(target.error);
      };
    });
  },

  async clearCache(): Promise<void> {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(DATA_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(DATA_STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => {
        logger.info('IndexedDB Cache cleared successfully.');
        resolve();
      };
      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }
};