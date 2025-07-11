/**
 * ModelCacheManager
 * 
 * Manages local caching and persistence of Whisper models
 * Optimized for medical consultation workflows
 */

export class ModelCacheManager {
  constructor(config = {}) {
    this.config = {
      cacheName: config.cacheName || 'whisper-models',
      maxCacheSize: config.maxCacheSize || 500 * 1024 * 1024, // 500MB
      modelUrls: config.modelUrls || {
        'whisper-base': 'https://huggingface.co/openai/whisper-base/resolve/main/',
        'whisper-small': 'https://huggingface.co/openai/whisper-small/resolve/main/',
        'whisper-medium': 'https://huggingface.co/openai/whisper-medium/resolve/main/'
      },
      wasmSupport: config.wasmSupport || false,
      ...config
    };

    this.cache = null;
    this.db = null;
    this.isInitialized = false;
    this.downloadProgress = new Map();
  }

  /**
   * Initialize cache manager
   */
  async initialize() {
    try {
      // Initialize Cache API
      await this.initializeCacheAPI();
      
      // Initialize IndexedDB for metadata
      await this.initializeIndexedDB();
      
      this.isInitialized = true;
      console.log('ModelCacheManager initialized');
      
    } catch (error) {
      console.error('Failed to initialize ModelCacheManager:', error);
      throw error;
    }
  }

  /**
   * Initialize Cache API
   */
  async initializeCacheAPI() {
    try {
      if ('caches' in window) {
        this.cache = await caches.open(this.config.cacheName);
        console.log('Cache API initialized');
      } else {
        console.warn('Cache API not supported');
      }
    } catch (error) {
      console.error('Cache API initialization failed:', error);
    }
  }

  /**
   * Initialize IndexedDB for metadata
   */
  async initializeIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('whisper-models-db', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create models store
        const modelsStore = db.createObjectStore('models', { keyPath: 'name' });
        modelsStore.createIndex('size', 'size', { unique: false });
        modelsStore.createIndex('lastUsed', 'lastUsed', { unique: false });
        
        // Create downloads store
        const downloadsStore = db.createObjectStore('downloads', { keyPath: 'id' });
        downloadsStore.createIndex('status', 'status', { unique: false });
      };
    });
  }

  /**
   * Check if model is cached
   */
  async isModelCached(modelName) {
    try {
      if (!this.cache) return false;
      
      const modelFiles = await this.getModelFiles(modelName);
      
      for (const file of modelFiles) {
        const response = await this.cache.match(file.url);
        if (!response) return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('Error checking model cache:', error);
      return false;
    }
  }

  /**
   * Download and cache model
   */
  async downloadModel(modelName, onProgress) {
    try {
      if (!this.cache) {
        throw new Error('Cache not initialized');
      }

      const modelFiles = await this.getModelFiles(modelName);
      const downloadId = `download-${modelName}-${Date.now()}`;
      
      // Initialize download tracking
      this.downloadProgress.set(downloadId, {
        modelName,
        totalFiles: modelFiles.length,
        downloadedFiles: 0,
        totalSize: 0,
        downloadedSize: 0
      });
      
      // Store download record
      await this.storeDownloadRecord(downloadId, modelName, 'downloading');
      
      // Download all model files
      const downloadPromises = modelFiles.map(file => 
        this.downloadFile(file, downloadId, onProgress)
      );
      
      await Promise.all(downloadPromises);
      
      // Update model metadata
      await this.updateModelMetadata(modelName);
      
      // Mark download as completed
      await this.storeDownloadRecord(downloadId, modelName, 'completed');
      
      console.log(`Model ${modelName} downloaded and cached successfully`);
      
    } catch (error) {
      console.error(`Failed to download model ${modelName}:`, error);
      await this.storeDownloadRecord(downloadId, modelName, 'failed');
      throw error;
    }
  }

  /**
   * Get model files list
   */
  async getModelFiles(modelName) {
    const baseUrl = this.config.modelUrls[modelName];
    
    if (!baseUrl) {
      throw new Error(`Model ${modelName} not supported`);
    }
    
    // Standard Whisper model files
    const files = [
      { name: 'config.json', url: `${baseUrl}config.json` },
      { name: 'tokenizer.json', url: `${baseUrl}tokenizer.json` },
      { name: 'model.onnx', url: `${baseUrl}model.onnx` }
    ];
    
    // Add WASM-specific files if needed
    if (this.config.wasmSupport) {
      files.push(
        { name: 'model.wasm', url: `${baseUrl}model.wasm` },
        { name: 'model.bin', url: `${baseUrl}model.bin` }
      );
    }
    
    return files;
  }

  /**
   * Download individual file
   */
  async downloadFile(file, downloadId, onProgress) {
    try {
      const response = await fetch(file.url);
      
      if (!response.ok) {
        throw new Error(`Failed to download ${file.name}: ${response.status}`);
      }
      
      const contentLength = parseInt(response.headers.get('content-length'), 10);
      const reader = response.body.getReader();
      const chunks = [];
      let downloadedSize = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        downloadedSize += value.length;
        
        // Update progress
        this.updateDownloadProgress(downloadId, value.length);
        
        if (onProgress) {
          const progress = this.downloadProgress.get(downloadId);
          onProgress({
            modelName: progress.modelName,
            fileName: file.name,
            downloadedSize,
            totalSize: contentLength,
            percentage: contentLength ? (downloadedSize / contentLength) * 100 : 0
          });
        }
      }
      
      // Combine chunks
      const combinedChunks = new Uint8Array(downloadedSize);
      let offset = 0;
      
      for (const chunk of chunks) {
        combinedChunks.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Create response and cache it
      const cachedResponse = new Response(combinedChunks, {
        headers: response.headers
      });
      
      await this.cache.put(file.url, cachedResponse);
      
      console.log(`Downloaded and cached: ${file.name}`);
      
    } catch (error) {
      console.error(`Failed to download file ${file.name}:`, error);
      throw error;
    }
  }

  /**
   * Update download progress
   */
  updateDownloadProgress(downloadId, sizeIncrement) {
    const progress = this.downloadProgress.get(downloadId);
    if (progress) {
      progress.downloadedSize += sizeIncrement;
      this.downloadProgress.set(downloadId, progress);
    }
  }

  /**
   * Get cached model
   */
  async getCachedModel(modelName) {
    try {
      if (!this.cache) return null;
      
      const modelFiles = await this.getModelFiles(modelName);
      const cachedFiles = {};
      
      for (const file of modelFiles) {
        const response = await this.cache.match(file.url);
        if (response) {
          cachedFiles[file.name] = await response.arrayBuffer();
        }
      }
      
      // Update last used timestamp
      await this.updateModelMetadata(modelName);
      
      return cachedFiles;
      
    } catch (error) {
      console.error(`Error getting cached model ${modelName}:`, error);
      return null;
    }
  }

  /**
   * Update model metadata
   */
  async updateModelMetadata(modelName) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      
      const modelData = {
        name: modelName,
        lastUsed: Date.now(),
        size: await this.getModelSize(modelName),
        downloadDate: Date.now()
      };
      
      await store.put(modelData);
      
    } catch (error) {
      console.error('Error updating model metadata:', error);
    }
  }

  /**
   * Get model size
   */
  async getModelSize(modelName) {
    try {
      if (!this.cache) return 0;
      
      const modelFiles = await this.getModelFiles(modelName);
      let totalSize = 0;
      
      for (const file of modelFiles) {
        const response = await this.cache.match(file.url);
        if (response) {
          const arrayBuffer = await response.arrayBuffer();
          totalSize += arrayBuffer.byteLength;
        }
      }
      
      return totalSize;
      
    } catch (error) {
      console.error('Error calculating model size:', error);
      return 0;
    }
  }

  /**
   * Store download record
   */
  async storeDownloadRecord(downloadId, modelName, status) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['downloads'], 'readwrite');
      const store = transaction.objectStore('downloads');
      
      const record = {
        id: downloadId,
        modelName,
        status,
        timestamp: Date.now()
      };
      
      await store.put(record);
      
    } catch (error) {
      console.error('Error storing download record:', error);
    }
  }

  /**
   * Get cached models list
   */
  async getCachedModels() {
    try {
      if (!this.db) return [];
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['models'], 'readonly');
        const store = transaction.objectStore('models');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('Error getting cached models:', error);
      return [];
    }
  }

  /**
   * Clear old models to free space
   */
  async clearOldModels(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const models = await this.getCachedModels();
      const now = Date.now();
      
      for (const model of models) {
        if (now - model.lastUsed > maxAge) {
          await this.removeModel(model.name);
          console.log(`Removed old model: ${model.name}`);
        }
      }
      
    } catch (error) {
      console.error('Error clearing old models:', error);
    }
  }

  /**
   * Remove model from cache
   */
  async removeModel(modelName) {
    try {
      if (!this.cache || !this.db) return;
      
      // Remove from cache
      const modelFiles = await this.getModelFiles(modelName);
      for (const file of modelFiles) {
        await this.cache.delete(file.url);
      }
      
      // Remove from database
      const transaction = this.db.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      await store.delete(modelName);
      
      console.log(`Model ${modelName} removed from cache`);
      
    } catch (error) {
      console.error(`Error removing model ${modelName}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const models = await this.getCachedModels();
      const totalSize = models.reduce((sum, model) => sum + model.size, 0);
      
      return {
        totalModels: models.length,
        totalSize,
        maxSize: this.config.maxCacheSize,
        usagePercentage: (totalSize / this.config.maxCacheSize) * 100,
        oldestModel: models.length > 0 ? 
          models.reduce((oldest, model) => 
            model.lastUsed < oldest.lastUsed ? model : oldest
          ) : null
      };
      
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Get cache directory for models
   */
  getCacheDir() {
    return this.config.cacheName;
  }

  /**
   * Cleanup cache manager
   */
  async cleanup() {
    try {
      // Clear download progress
      this.downloadProgress.clear();
      
      // Close database
      if (this.db) {
        this.db.close();
        this.db = null;
      }
      
      // Clear cache reference
      this.cache = null;
      
      this.isInitialized = false;
      console.log('ModelCacheManager cleanup completed');
      
    } catch (error) {
      console.error('Error during ModelCacheManager cleanup:', error);
    }
  }
}

export default ModelCacheManager;