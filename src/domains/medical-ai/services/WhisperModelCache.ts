interface CachedModel {
  modelData: any;
  version: string;
  timestamp: number;
}

const DB_NAME = 'WhisperModelCache';
const STORE_NAME = 'models';
const MODEL_KEY = 'whisper-base';
const CACHE_VERSION = '1.0.0';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

class WhisperModelCacheService {
  private db: IDBDatabase | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async saveModel(modelData: any): Promise<void> {
    if (!this.isSupported) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ModelCache] IndexedDB not supported, skipping cache');
      }
      return;
    }

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const cachedModel: CachedModel = {
        modelData,
        version: CACHE_VERSION,
        timestamp: Date.now(),
      };

      const request = store.put(cachedModel, MODEL_KEY);
      
      await new Promise((resolve, reject) => {
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[ModelCache] Model saved to IndexedDB');
      }
    } catch (error) {
      console.error('[ModelCache] Failed to save model:', error);
    }
  }

  async loadModel(): Promise<any | null> {
    if (!this.isSupported) {
      return null;
    }

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(MODEL_KEY);

      const cachedModel = await new Promise<CachedModel | undefined>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!cachedModel) {
        return null;
      }

      // Check version
      if (cachedModel.version !== CACHE_VERSION) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ModelCache] Cache version mismatch, invalidating');
        }
        await this.clearCache();
        return null;
      }

      // Check age
      const age = Date.now() - cachedModel.timestamp;
      if (age > CACHE_DURATION) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ModelCache] Cache expired, invalidating');
        }
        await this.clearCache();
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[ModelCache] Model loaded from IndexedDB');
      }

      return cachedModel.modelData;
    } catch (error) {
      console.error('[ModelCache] Failed to load model:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(MODEL_KEY);

      await new Promise((resolve, reject) => {
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[ModelCache] Cache cleared');
      }
    } catch (error) {
      console.error('[ModelCache] Failed to clear cache:', error);
    }
  }

  async getCacheInfo(): Promise<{ exists: boolean; age?: number; version?: string } | null> {
    if (!this.isSupported) return null;

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(MODEL_KEY);

      const cachedModel = await new Promise<CachedModel | undefined>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!cachedModel) {
        return { exists: false };
      }

      return {
        exists: true,
        age: Date.now() - cachedModel.timestamp,
        version: cachedModel.version,
      };
    } catch (error) {
      console.error('[ModelCache] Failed to get cache info:', error);
      return null;
    }
  }
}

export const whisperModelCache = new WhisperModelCacheService();