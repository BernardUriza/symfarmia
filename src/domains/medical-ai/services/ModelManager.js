/**
 * ModelManager
 * 
 * Manages Whisper model loading, caching, and optimization
 * Handles model download, verification, and browser storage
 */

export class ModelManager {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/models',
      cacheEnabled: config.cacheEnabled !== false,
      maxCacheSize: config.maxCacheSize || 500 * 1024 * 1024, // 500MB
      compressionEnabled: config.compressionEnabled !== false,
      ...config
    };
    
    this.cache = new Map();
    this.downloadProgress = new Map();
    this.modelManifest = null;
    this.storage = null;
    this.initialized = false;
  }

  /**
   * Initialize model manager
   */
  async initialize() {
    try {
      // Initialize IndexedDB storage
      await this.initializeStorage();
      
      // Load model manifest
      await this.loadModelManifest();
      
      // Load cached models
      await this.loadCachedModels();
      
      this.initialized = true;
      console.log('ModelManager initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize ModelManager:', error);
      throw error;
    }
  }

  /**
   * Initialize IndexedDB storage
   */
  async initializeStorage() {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available, model caching disabled');
      this.config.cacheEnabled = false;
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WhisperModels', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.storage = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for models
        if (!db.objectStoreNames.contains('models')) {
          const modelStore = db.createObjectStore('models', { keyPath: 'name' });
          modelStore.createIndex('size', 'size');
          modelStore.createIndex('timestamp', 'timestamp');
        }
        
        // Create object store for metadata
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Load model manifest
   */
  async loadModelManifest() {
    try {
      const response = await fetch(`${this.config.baseUrl}/manifest.json`);
      
      if (response.ok) {
        this.modelManifest = await response.json();
      } else {
        // Create default manifest
        this.modelManifest = this.createDefaultManifest();
      }
      
      console.log('Model manifest loaded:', this.modelManifest);
      
    } catch (error) {
      console.warn('Failed to load model manifest, using defaults:', error);
      this.modelManifest = this.createDefaultManifest();
    }
  }

  /**
   * Create default model manifest
   */
  createDefaultManifest() {
    return {
      version: '1.0.0',
      models: {
        'whisper-base': {
          name: 'whisper-base',
          size: 148000000, // ~148MB
          description: 'Base model for general use',
          languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
          accuracy: 'good',
          speed: 'fast',
          recommended: true
        },
        'whisper-base-en': {
          name: 'whisper-base-en',
          size: 148000000,
          description: 'Base English-only model',
          languages: ['en'],
          accuracy: 'good',
          speed: 'fast',
          recommended: false
        },
        'whisper-small': {
          name: 'whisper-small',
          size: 488000000, // ~488MB
          description: 'Small model with better accuracy',
          languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
          accuracy: 'better',
          speed: 'medium',
          recommended: false
        },
        'whisper-small-en': {
          name: 'whisper-small-en',
          size: 488000000,
          description: 'Small English-only model',
          languages: ['en'],
          accuracy: 'better',
          speed: 'medium',
          recommended: false
        }
      }
    };
  }

  /**
   * Load cached models from IndexedDB
   */
  async loadCachedModels() {
    if (!this.config.cacheEnabled || !this.storage) {
      return;
    }

    try {
      const transaction = this.storage.transaction(['models'], 'readonly');
      const store = transaction.objectStore('models');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const cachedModels = request.result;
        
        for (const model of cachedModels) {
          this.cache.set(model.name, {
            data: model.data,
            size: model.size,
            timestamp: model.timestamp,
            cached: true
          });
        }
        
        console.log(`Loaded ${cachedModels.length} cached models`);
      };
      
    } catch (error) {
      console.error('Failed to load cached models:', error);
    }
  }

  /**
   * Get model information
   */
  getModelInfo(modelName) {
    if (!this.modelManifest) {
      return null;
    }
    
    return this.modelManifest.models[modelName] || null;
  }

  /**
   * List available models
   */
  listModels() {
    if (!this.modelManifest) {
      return [];
    }
    
    return Object.values(this.modelManifest.models).map(model => ({
      ...model,
      cached: this.cache.has(model.name),
      downloading: this.downloadProgress.has(model.name)
    }));
  }

  /**
   * Check if model is cached
   */
  isModelCached(modelName) {
    return this.cache.has(modelName);
  }

  /**
   * Get model from cache or download
   */
  async getModel(modelName) {
    // Check cache first
    if (this.cache.has(modelName)) {
      const cached = this.cache.get(modelName);
      console.log(`Using cached model: ${modelName}`);
      return cached.data;
    }
    
    // Download if not cached
    return await this.downloadModel(modelName);
  }

  /**
   * Download model
   */
  async downloadModel(modelName, onProgress = null) {
    const modelInfo = this.getModelInfo(modelName);
    
    if (!modelInfo) {
      throw new Error(`Model not found: ${modelName}`);
    }

    // Check if already downloading
    if (this.downloadProgress.has(modelName)) {
      throw new Error(`Model ${modelName} is already being downloaded`);
    }

    const modelUrl = `${this.config.baseUrl}/${modelName}.bin`;
    
    try {
      console.log(`Downloading model: ${modelName} from ${modelUrl}`);
      
      this.downloadProgress.set(modelName, { progress: 0, total: modelInfo.size });
      
      const response = await fetch(modelUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentLength = parseInt(response.headers.get('Content-Length') || modelInfo.size);
      const reader = response.body.getReader();
      const chunks = [];
      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Update progress
        const progress = Math.round((receivedLength / contentLength) * 100);
        this.downloadProgress.set(modelName, { progress, total: contentLength });
        
        if (onProgress) {
          onProgress(progress, receivedLength, contentLength);
        }
      }
      
      // Combine chunks
      const modelData = new Uint8Array(receivedLength);
      let position = 0;
      
      for (const chunk of chunks) {
        modelData.set(chunk, position);
        position += chunk.length;
      }
      
      console.log(`Model ${modelName} downloaded successfully: ${receivedLength} bytes`);
      
      // Cache the model
      await this.cacheModel(modelName, modelData);
      
      // Clear download progress
      this.downloadProgress.delete(modelName);
      
      return modelData;
      
    } catch (error) {
      this.downloadProgress.delete(modelName);
      console.error(`Failed to download model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Cache model in IndexedDB
   */
  async cacheModel(modelName, modelData) {
    if (!this.config.cacheEnabled || !this.storage) {
      // Still cache in memory
      this.cache.set(modelName, {
        data: modelData,
        size: modelData.length,
        timestamp: Date.now(),
        cached: false
      });
      return;
    }

    try {
      // Check cache size limit
      await this.enforceCache SizeLimit(modelData.length);
      
      const transaction = this.storage.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      
      const modelRecord = {
        name: modelName,
        data: modelData,
        size: modelData.length,
        timestamp: Date.now()
      };
      
      await new Promise((resolve, reject) => {
        const request = store.put(modelRecord);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // Update memory cache
      this.cache.set(modelName, {
        data: modelData,
        size: modelData.length,
        timestamp: Date.now(),
        cached: true
      });
      
      console.log(`Model ${modelName} cached successfully`);
      
    } catch (error) {
      console.error(`Failed to cache model ${modelName}:`, error);
      
      // Fallback to memory cache
      this.cache.set(modelName, {
        data: modelData,
        size: modelData.length,
        timestamp: Date.now(),
        cached: false
      });
    }
  }

  /**
   * Enforce cache size limit
   */
  async enforceCacheSizeLimit(newModelSize) {
    if (!this.storage) return;

    try {
      const transaction = this.storage.transaction(['models'], 'readonly');
      const store = transaction.objectStore('models');
      const request = store.getAll();
      
      request.onsuccess = async () => {
        const cachedModels = request.result;
        const totalSize = cachedModels.reduce((sum, model) => sum + model.size, 0);
        
        if (totalSize + newModelSize > this.config.maxCacheSize) {
          console.log('Cache size limit exceeded, removing old models...');
          
          // Sort by timestamp (oldest first)
          cachedModels.sort((a, b) => a.timestamp - b.timestamp);
          
          let removedSize = 0;
          const toRemove = [];
          
          for (const model of cachedModels) {
            if (totalSize + newModelSize - removedSize <= this.config.maxCacheSize) {
              break;
            }
            
            toRemove.push(model.name);
            removedSize += model.size;
          }
          
          // Remove old models
          for (const modelName of toRemove) {
            await this.removeModelFromCache(modelName);
          }
        }
      };
      
    } catch (error) {
      console.error('Failed to enforce cache size limit:', error);
    }
  }

  /**
   * Remove model from cache
   */
  async removeModelFromCache(modelName) {
    if (!this.storage) return;

    try {
      const transaction = this.storage.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      
      await new Promise((resolve, reject) => {
        const request = store.delete(modelName);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // Remove from memory cache
      this.cache.delete(modelName);
      
      console.log(`Model ${modelName} removed from cache`);
      
    } catch (error) {
      console.error(`Failed to remove model ${modelName} from cache:`, error);
    }
  }

  /**
   * Clear all cached models
   */
  async clearCache() {
    if (!this.storage) return;

    try {
      const transaction = this.storage.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      // Clear memory cache
      this.cache.clear();
      
      console.log('All cached models cleared');
      
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      totalModels: this.cache.size,
      totalSize: 0,
      models: []
    };
    
    for (const [name, model] of this.cache.entries()) {
      stats.totalSize += model.size;
      stats.models.push({
        name,
        size: model.size,
        timestamp: model.timestamp,
        cached: model.cached
      });
    }
    
    return stats;
  }

  /**
   * Get download progress
   */
  getDownloadProgress(modelName) {
    return this.downloadProgress.get(modelName) || null;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (this.storage) {
        this.storage.close();
        this.storage = null;
      }
      
      this.cache.clear();
      this.downloadProgress.clear();
      this.modelManifest = null;
      this.initialized = false;
      
      console.log('ModelManager cleanup completed');
      
    } catch (error) {
      console.error('Error during ModelManager cleanup:', error);
    }
  }
}

export default ModelManager;