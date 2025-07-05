// Storage middleware for state persistence between sessions
import type {
  AppState,
  MedicalStateAction,
  MedicalError,
  ConsultationState
} from '../types';
import type { AIMessage, ClinicalAlert, MedicalTranscription } from '../../types/medical';

export interface StorageConfig {
  key: string;
  version: number;
  maxSize: number; // Maximum storage size in bytes
  compressData: boolean;
  debounceMs: number; // Debounce save operations
  excludeKeys: string[]; // Keys to exclude from persistence
}

export interface StorageMetadata {
  version: number;
  timestamp: Date;
  checksum: string;
  size: number;
}

type Stored<T> = Omit<T, 'timestamp'> & { timestamp: string };

export class StorageMiddleware {
  private config: StorageConfig;
  private saveTimeout?: number;
  private lastSavedState?: string;
  private isHydrating = false;
  
  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      key: 'symfarmia_medical_state',
      version: 1,
      maxSize: 50 * 1024 * 1024, // 50MB
      compressData: true,
      debounceMs: 1000,
      excludeKeys: ['system.loading', 'system.initializing'],
      ...config
    };
  }
  
  // Middleware function
  middleware = (store: { getState: () => AppState; dispatch: (action: MedicalStateAction) => void }) => 
    (next: (action: MedicalStateAction) => void) => 
    (action: MedicalStateAction) => {
      
      // Handle hydration action
      if (action.type === 'HYDRATE_STATE') {
        this.isHydrating = true;
        next(action);
        this.isHydrating = false;
        return;
      }
      
      // Process action
      next(action);
      
      // Skip saving during hydration
      if (this.isHydrating) return;
      
      // Skip saving for certain action types
      const skipSaveActions = [
        'UPDATE_LIVE_TRANSCRIPT',
        'UPDATE_AUDIO_LEVEL',
        'SET_LOADING',
        'UPDATE_PERFORMANCE'
      ];
      
      if (skipSaveActions.includes(action.type)) return;
      
      // Debounce save operations
      this.debouncedSave(store.getState());
    };
  
  private debouncedSave(state: AppState): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = window.setTimeout(() => {
      this.saveState(state);
    }, this.config.debounceMs);
  }
  
  async saveState(state: AppState): Promise<boolean> {
    try {
      // Create sanitized state for storage
      const stateToSave = this.sanitizeStateForStorage(state);
      const serializedState = JSON.stringify(stateToSave);
      
      // Check if state has actually changed
      if (this.lastSavedState === serializedState) {
        return true;
      }
      
      // Compress if enabled
      const dataToStore = this.config.compressData 
        ? await this.compressData(serializedState)
        : serializedState;
      
      // Check size limits
      const dataSize = new Blob([dataToStore]).size;
      if (dataSize > this.config.maxSize) {
        console.warn('State size exceeds storage limit, attempting cleanup');
        const cleanedState = this.performStorageCleanup(stateToSave);
        const cleanedData = this.config.compressData 
          ? await this.compressData(JSON.stringify(cleanedState))
          : JSON.stringify(cleanedState);
        
        if (new Blob([cleanedData]).size > this.config.maxSize) {
          throw new Error('State too large for storage even after cleanup');
        }
        
        return this.saveDataToStorage(cleanedData, dataSize);
      }
      
      this.lastSavedState = serializedState;
      return this.saveDataToStorage(dataToStore, dataSize);
      
    } catch (error) {
      console.error('Failed to save state:', error);
      
      // Emit storage error event
      window.dispatchEvent(new CustomEvent('storageError', {
        detail: {
          error,
          operation: 'save',
          timestamp: new Date()
        }
      }));
      
      return false;
    }
  }
  
  private async saveDataToStorage(data: string, size: number): Promise<boolean> {
    const metadata: StorageMetadata = {
      version: this.config.version,
      timestamp: new Date(),
      checksum: await this.calculateChecksum(data),
      size
    };
    
    // Save metadata and data
    localStorage.setItem(`${this.config.key}_meta`, JSON.stringify(metadata));
    localStorage.setItem(this.config.key, data);
    
    // Also try to save to IndexedDB for larger storage capacity
    await this.saveToIndexedDB(data, metadata);
    
    console.log(`State saved successfully (${(size / 1024).toFixed(1)} KB)`);
    return true;
  }
  
  async loadState(): Promise<AppState | null> {
    try {
      // Try IndexedDB first, fallback to localStorage
      let data = await this.loadFromIndexedDB();
      let metadata: StorageMetadata | null = null;
      
      if (!data) {
        // Fallback to localStorage
        const metaData = localStorage.getItem(`${this.config.key}_meta`);
        const stateData = localStorage.getItem(this.config.key);
        
        if (!metaData || !stateData) {
          console.log('No persisted state found');
          return null;
        }
        
        metadata = JSON.parse(metaData);
        data = stateData;
      }
      
      // Validate version compatibility
      if (metadata && metadata.version !== this.config.version) {
        console.warn('State version mismatch, performing migration');
        data = await this.migrateState(data, metadata.version, this.config.version);
      }
      
      // Verify checksum if available
      if (metadata?.checksum) {
        const currentChecksum = await this.calculateChecksum(data);
        if (currentChecksum !== metadata.checksum) {
          throw new Error('State checksum mismatch - data may be corrupted');
        }
      }
      
      // Decompress if needed
      const decompressedData = this.config.compressData 
        ? await this.decompressData(data)
        : data;
      
      const parsedState = JSON.parse(decompressedData);
      
      // Rehydrate dates and other complex objects
      const hydratedState = this.hydrateState(parsedState);
      
      console.log('State loaded successfully from storage');
      return hydratedState;
      
    } catch (error) {
      console.error('Failed to load state:', error);
      
      // Clear corrupted storage
      this.clearStorage();
      
      // Emit storage error event
      window.dispatchEvent(new CustomEvent('storageError', {
        detail: {
          error,
          operation: 'load',
          timestamp: new Date()
        }
      }));
      
      return null;
    }
  }
  
  private sanitizeStateForStorage(state: AppState): Partial<AppState> {
    const sanitized: Partial<AppState> = { ...state };
    
    // Remove excluded keys
    this.config.excludeKeys.forEach(keyPath => {
      const keys = keyPath.split('.');
      let current = sanitized as Record<string, unknown>;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]]) {
          current = current[keys[i]] as Record<string, unknown>;
        } else {
          return; // Key path doesn't exist
        }
      }
      
      delete current[keys[keys.length - 1]];
    });
    
    // Clean up system state
    if (sanitized.system) {
      sanitized.system = {
        ...sanitized.system,
        loading: false,
        initializing: false,
        online: navigator.onLine
      };
    }
    
    // Clean up active consultations older than 24 hours
    if (sanitized.consultations?.active) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeConsultations = Object.entries(sanitized.consultations.active)
        .filter(([_, consultation]) => {
          const lastActivity = new Date(consultation.metadata.lastActivity);
          return lastActivity > oneDayAgo;
        });
      
      sanitized.consultations.active = Object.fromEntries(activeConsultations);
    }
    
    return sanitized;
  }
  
  private performStorageCleanup(state: Partial<AppState>): Partial<AppState> {
    const cleaned: Partial<AppState> = { ...state };
    
    // Aggressive cleanup for storage size optimization
    if (cleaned.consultations) {
      // Keep only 3 most recent active consultations
      if (cleaned.consultations.active) {
        const sortedConsultations = Object.entries(cleaned.consultations.active)
          .sort(([,a], [,b]) =>
            new Date(b.metadata?.lastActivity ?? 0).getTime() -
            new Date(a.metadata?.lastActivity ?? 0).getTime()
          )
          .slice(0, 3);
        
        cleaned.consultations.active = Object.fromEntries(sortedConsultations);
      }
      
      // Keep only 10 most recent archived consultations
      if (cleaned.consultations.archived) {
        const sortedArchived = Object.entries(cleaned.consultations.archived)
          .sort(([,a], [,b]) =>
            new Date(b.metadata?.lastActivity ?? 0).getTime() -
            new Date(a.metadata?.lastActivity ?? 0).getTime()
          )
          .slice(0, 10);
        
        cleaned.consultations.archived = Object.fromEntries(sortedArchived);
      }
      
      // Limit consultation history
      if (cleaned.consultations.history) {
        cleaned.consultations.history = cleaned.consultations.history.slice(0, 20);
      }
    }
    
    // Clean system errors and notifications
    if (cleaned.system) {
      cleaned.system.errors = cleaned.system.errors?.slice(-10) || [];
      cleaned.system.notifications = cleaned.system.notifications?.slice(-20) || [];
    }
    
    return cleaned;
  }
  
  private hydrateState(state: Record<string, unknown>): AppState {
    // Convert date strings back to Date objects
    const hydrated: Partial<AppState> = { ...(state as Partial<AppState>) };
    
    // Hydrate system dates
    if (hydrated.system?.notifications) {
      hydrated.system.notifications = (hydrated.system.notifications as unknown as Array<Stored<AppState['system']['notifications'][number]>>).map(
        (notification): AppState['system']['notifications'][number] => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        })
      );
    }
    
    if (hydrated.system?.errors) {
      hydrated.system.errors = (hydrated.system.errors as unknown as Array<Stored<MedicalError>>).map(
        (error): MedicalError => ({
          ...error,
          timestamp: new Date(error.timestamp)
        })
      );
    }
    
    // Hydrate user statistics
    if (hydrated.user?.statistics?.lastActivity) {
      hydrated.user.statistics.lastActivity = new Date(hydrated.user.statistics.lastActivity);
    }
    
    // Hydrate consultation dates
    const consultations = hydrated.consultations as AppState['consultations'] | undefined;
    if (consultations?.active) {
      Object.keys(consultations.active).forEach(id => {
        const consultation = consultations.active[id];
        
        // Session dates
        if (consultation.session.startTime) {
          consultation.session.startTime = new Date(consultation.session.startTime);
        }
        if (consultation.session.endTime) {
          consultation.session.endTime = new Date(consultation.session.endTime);
        }
        
        // Metadata dates
        if (consultation.metadata.lastActivity) {
          consultation.metadata.lastActivity = new Date(consultation.metadata.lastActivity);
        }
        if (consultation.metadata.createdAt) {
          consultation.metadata.createdAt = new Date(consultation.metadata.createdAt);
        }
        
        // Transcription dates
        if (consultation.transcription.transcriptions) {
          consultation.transcription.transcriptions = (
            consultation.transcription.transcriptions as unknown as Array<Stored<MedicalTranscription>>
          ).map(
            (t): MedicalTranscription => ({
              ...t,
              timestamp: new Date(t.timestamp) as unknown as number
            })
          );
        }
        
        // AI message dates
        if (consultation.ai.messages) {
          consultation.ai.messages = (
            consultation.ai.messages as unknown as Array<Stored<AIMessage>>
          ).map(
            (msg): AIMessage => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })
          );
        }
        
        // Clinical alert dates
        if (consultation.ai.clinicalAlerts) {
          consultation.ai.clinicalAlerts = (
            consultation.ai.clinicalAlerts as unknown as Array<Stored<ClinicalAlert>>
          ).map(
            (alert): ClinicalAlert => ({
              ...alert,
              timestamp: new Date(alert.timestamp)
            })
          );
        }
        
        // Documentation dates
        if (consultation.documentation.lastSaved) {
          consultation.documentation.lastSaved = new Date(consultation.documentation.lastSaved);
        }
        
        if (consultation.documentation.editHistory) {
          consultation.documentation.editHistory = (
            consultation.documentation.editHistory as unknown as Array<Stored<ConsultationState['documentation']['editHistory'][number]>>
          ).map(
            (edit): ConsultationState['documentation']['editHistory'][number] => ({
              ...edit,
              timestamp: new Date(edit.timestamp)
            })
          );
        }
      });
    }
    
    return hydrated as AppState;
  }
  
  private async compressData(data: string): Promise<string> {
    // Simple compression using built-in compression
    if ('CompressionStream' in window) {
      try {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(new TextEncoder().encode(data));
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }
        
        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        chunks.forEach(chunk => {
          compressed.set(chunk, offset);
          offset += chunk.length;
        });
        
        return btoa(String.fromCharCode(...compressed));
      } catch (error) {
        console.warn('Compression failed, using uncompressed data:', error);
        return data;
      }
    }
    
    return data; // Fallback to uncompressed
  }
  
  private async decompressData(data: string): Promise<string> {
    // Decompress if compression was used
    if ('DecompressionStream' in window && data !== JSON.stringify(JSON.parse(data))) {
      try {
        const compressed = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(compressed);
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }
        
        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        chunks.forEach(chunk => {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        });
        
        return new TextDecoder().decode(decompressed);
      } catch (error) {
        console.warn('Decompression failed, treating as uncompressed:', error);
        return data;
      }
    }
    
    return data;
  }
  
  private async calculateChecksum(data: string): Promise<string> {
    if ('crypto' in window && 'subtle' in crypto) {
      try {
        const buffer = new TextEncoder().encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.warn('Checksum calculation failed:', error);
      }
    }
    
    // Simple fallback checksum
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
  
  private async saveToIndexedDB(data: string, metadata: StorageMetadata): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SymfarmiaStorage', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['state'], 'readwrite');
        const store = transaction.objectStore('state');
        
        store.put({
          id: this.config.key,
          data,
          metadata,
          timestamp: new Date()
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.createObjectStore('state', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      };
    });
  }
  
  private async loadFromIndexedDB(): Promise<string | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('SymfarmiaStorage', 1);
      
      request.onerror = () => resolve(null); // Fallback to localStorage
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['state'], 'readonly');
        const store = transaction.objectStore('state');
        const getRequest = store.get(this.config.key);
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result ? result.data : null);
        };
        
        getRequest.onerror = () => resolve(null);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.createObjectStore('state', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      };
    });
  }
  
  private async migrateState(data: string, fromVersion: number, toVersion: number): Promise<string> {
    console.log(`Migrating state from version ${fromVersion} to ${toVersion}`);
    
    const migrated = JSON.parse(data);
    
    // Add migration logic here for future versions
    // Example:
    // if (fromVersion === 1 && toVersion === 2) {
    //   migrated = this.migrateV1ToV2(migrated);
    // }
    
    return JSON.stringify(migrated);
  }
  
  clearStorage(): void {
    localStorage.removeItem(this.config.key);
    localStorage.removeItem(`${this.config.key}_meta`);
    
    // Clear IndexedDB
    const deleteRequest = indexedDB.deleteDatabase('SymfarmiaStorage');
    deleteRequest.onsuccess = () => console.log('IndexedDB cleared');
    deleteRequest.onerror = () => console.warn('Failed to clear IndexedDB');
  }
  
  // Get storage usage statistics
  async getStorageInfo(): Promise<{
    used: number;
    available: number;
    quota: number;
    efficiency: number;
  }> {
    let used = 0;
    let available = 0;
    let quota = 0;
    
    // Check localStorage usage
    const localStorageData = localStorage.getItem(this.config.key);
    if (localStorageData) {
      used += new Blob([localStorageData]).size;
    }
    
    // Check navigator storage API if available
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || 0;
        used += estimate.usage || 0;
        available = quota - used;
      } catch (error) {
        console.warn('Storage estimation failed:', error);
      }
    }
    
    const efficiency = quota > 0 ? (used / quota) * 100 : 0;
    
    return { used, available, quota, efficiency };
  }
}