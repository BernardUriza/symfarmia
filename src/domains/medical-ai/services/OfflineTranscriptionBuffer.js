/**
 * Offline Transcription Buffer
 * 
 * Handles audio queuing during network issues with intelligent storage and processing
 */

export class OfflineTranscriptionBuffer {
  constructor() {
    this.dbName = 'MedicalTranscriptionBuffer';
    this.dbVersion = 1;
    this.storeName = 'audioQueue';
    this.db = null;
    this.isInitialized = false;
    this.maxBufferSize = 100 * 1024 * 1024; // 100MB
    this.maxQueueItems = 500;
    this.currentBufferSize = 0;
    this.queueItems = [];
    this.processingQueue = false;
    this.compressionEnabled = true;
    this.retentionPolicy = 24 * 60 * 60 * 1000; // 24 hours
    this.callbacks = new Map();
    
    this.initialize();
  }

  /**
   * Initialize IndexedDB and setup storage
   */
  async initialize() {
    try {
      this.db = await this.openDatabase();
      await this.loadQueueFromStorage();
      this.startCleanupTimer();
      this.isInitialized = true;
      
      console.log('OfflineTranscriptionBuffer initialized');
      
    } catch (error) {
      console.error('Failed to initialize OfflineTranscriptionBuffer:', error);
      // Fallback to memory-only storage
      this.initializeFallbackStorage();
    }
  }

  /**
   * Open IndexedDB database
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for audio queue
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        
        // Create indexes
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('consultationId', 'consultationId', { unique: false });
      };
    });
  }

  /**
   * Initialize fallback storage for when IndexedDB is not available
   */
  initializeFallbackStorage() {
    console.warn('Using fallback memory storage for transcription buffer');
    this.fallbackStorage = new Map();
    this.isInitialized = true;
  }

  /**
   * Add audio chunk to buffer queue
   */
  async addToQueue(audioData, metadata = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Check storage limits
      if (this.queueItems.length >= this.maxQueueItems) {
        console.warn('Queue is full, removing oldest item');
        await this.removeOldestItem();
      }
      
      // Create queue item
      const queueItem = {
        id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        audioData: await this.compressAudioData(audioData),
        metadata: {
          ...metadata,
          originalSize: audioData.size || audioData.byteLength,
          consultationId: metadata.consultationId || 'unknown',
          patientId: metadata.patientId || 'unknown',
          priority: metadata.priority || 'medium',
          attempts: 0,
          maxAttempts: 3
        },
        status: 'pending', // pending, processing, completed, failed
        retryCount: 0,
        lastAttempt: null,
        processingStarted: null,
        processingCompleted: null
      };
      
      // Add to storage
      await this.storeQueueItem(queueItem);
      
      // Update queue in memory
      this.queueItems.push(queueItem);
      this.currentBufferSize += queueItem.audioData.byteLength || queueItem.audioData.size || 0;
      
      // Trigger processing if network is available
      this.triggerProcessingIfOnline();
      
      console.log(`Added audio chunk to queue: ${queueItem.id}`);
      
      return queueItem.id;
      
    } catch (error) {
      console.error('Failed to add audio chunk to queue:', error);
      throw error;
    }
  }

  /**
   * Compress audio data to save storage space
   */
  async compressAudioData(audioData) {
    if (!this.compressionEnabled) {
      return audioData;
    }
    
    try {
      // For ArrayBuffer, convert to Uint8Array and compress
      if (audioData instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(audioData);
        return await this.compressUint8Array(uint8Array);
      }
      
      // For Blob, read as ArrayBuffer and compress
      if (audioData instanceof Blob) {
        const arrayBuffer = await audioData.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const compressed = await this.compressUint8Array(uint8Array);
        return new Blob([compressed], { type: audioData.type });
      }
      
      return audioData;
      
    } catch (error) {
      console.error('Audio compression failed, using original data:', error);
      return audioData;
    }
  }

  /**
   * Compress Uint8Array data
   */
  async compressUint8Array(data) {
    try {
      // Simple compression using gzip if available
      if (typeof CompressionStream !== 'undefined') {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(data);
        writer.close();
        
        const chunks = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }
        
        return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      }
      
      return data; // Return original if compression not available
      
    } catch (error) {
      console.error('Compression failed:', error);
      return data;
    }
  }

  /**
   * Store queue item in IndexedDB
   */
  async storeQueueItem(queueItem) {
    try {
      if (!this.db) {
        // Use fallback storage
        this.fallbackStorage.set(queueItem.id, queueItem);
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.put(queueItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('Failed to store queue item:', error);
      throw error;
    }
  }

  /**
   * Load queue from storage
   */
  async loadQueueFromStorage() {
    try {
      if (!this.db) {
        // Load from fallback storage
        this.queueItems = Array.from(this.fallbackStorage.values());
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const items = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      this.queueItems = items.sort((a, b) => {
        // Sort by priority and timestamp
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const priorityDiff = priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority];
        
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      // Calculate current buffer size
      this.currentBufferSize = this.queueItems.reduce((total, item) => {
        return total + (item.audioData.byteLength || item.audioData.size || 0);
      }, 0);
      
      console.log(`Loaded ${this.queueItems.length} items from storage`);
      
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
      this.queueItems = [];
    }
  }

  /**
   * Process queue when network is available
   */
  async processQueue() {
    if (this.processingQueue || !navigator.onLine) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      const pendingItems = this.queueItems.filter(item => 
        item.status === 'pending' || (item.status === 'failed' && item.retryCount < item.metadata.maxAttempts)
      );
      
      console.log(`Processing ${pendingItems.length} pending items`);
      
      for (const item of pendingItems) {
        try {
          await this.processQueueItem(item);
          
          // Small delay between items to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to process queue item ${item.id}:`, error);
          await this.handleItemProcessingFailure(item, error);
        }
      }
      
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Process individual queue item
   */
  async processQueueItem(item) {
    try {
      item.status = 'processing';
      item.processingStarted = new Date();
      item.lastAttempt = new Date();
      
      await this.updateQueueItem(item);
      
      // Decompress audio data if needed
      const audioData = await this.decompressAudioData(item.audioData);
      
      // Call transcription service
      const result = await this.sendToTranscriptionService(audioData, item.metadata);
      
      // Mark as completed
      item.status = 'completed';
      item.processingCompleted = new Date();
      item.result = result;
      
      await this.updateQueueItem(item);
      
      // Trigger success callback
      this.triggerCallback('itemProcessed', item);
      
      console.log(`Successfully processed queue item ${item.id}`);
      
    } catch (error) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      throw error;
    }
  }

  /**
   * Handle item processing failure
   */
  async handleItemProcessingFailure(item, error) {
    item.retryCount++;
    item.lastError = error.message;
    item.lastAttempt = new Date();
    
    if (item.retryCount >= item.metadata.maxAttempts) {
      item.status = 'failed';
      console.error(`Queue item ${item.id} failed permanently after ${item.retryCount} attempts`);
      
      // Trigger failure callback
      this.triggerCallback('itemFailed', item);
    } else {
      item.status = 'pending';
      console.log(`Queue item ${item.id} will be retried (attempt ${item.retryCount}/${item.metadata.maxAttempts})`);
    }
    
    await this.updateQueueItem(item);
  }

  /**
   * Send audio data to transcription service
   */
  async sendToTranscriptionService(audioData, metadata) {
    try {
      // This would integrate with the actual transcription service
      // For now, we'll simulate the process
      
      const formData = new FormData();
      formData.append('audio', new Blob([audioData], { type: 'audio/wav' }));
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Transcription service error: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Transcription service error:', error);
      throw error;
    }
  }

  /**
   * Decompress audio data
   */
  async decompressAudioData(audioData) {
    try {
      if (audioData instanceof Uint8Array && typeof DecompressionStream !== 'undefined') {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(audioData);
        writer.close();
        
        const chunks = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }
        
        return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      }
      
      return audioData;
      
    } catch (error) {
      console.error('Decompression failed:', error);
      return audioData;
    }
  }

  /**
   * Update queue item in storage
   */
  async updateQueueItem(item) {
    try {
      if (!this.db) {
        // Update fallback storage
        this.fallbackStorage.set(item.id, item);
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('Failed to update queue item:', error);
      throw error;
    }
  }

  /**
   * Remove oldest item from queue
   */
  async removeOldestItem() {
    try {
      const oldestItem = this.queueItems.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      )[0];
      
      if (oldestItem) {
        await this.removeQueueItem(oldestItem.id);
      }
      
    } catch (error) {
      console.error('Failed to remove oldest item:', error);
    }
  }

  /**
   * Remove queue item
   */
  async removeQueueItem(itemId) {
    try {
      if (!this.db) {
        // Remove from fallback storage
        this.fallbackStorage.delete(itemId);
      } else {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        await new Promise((resolve, reject) => {
          const request = store.delete(itemId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
      
      // Remove from memory
      this.queueItems = this.queueItems.filter(item => item.id !== itemId);
      
      console.log(`Removed queue item ${itemId}`);
      
    } catch (error) {
      console.error('Failed to remove queue item:', error);
      throw error;
    }
  }

  /**
   * Trigger processing if network is online
   */
  triggerProcessingIfOnline() {
    if (navigator.onLine && !this.processingQueue) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Register callback for events
   */
  onEvent(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    
    this.callbacks.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.get(event).delete(callback);
    };
  }

  /**
   * Trigger callback for event
   */
  triggerCallback(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in callback:', error);
        }
      });
    }
  }

  /**
   * Start cleanup timer for old items
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupOldItems();
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Clean up old items based on retention policy
   */
  async cleanupOldItems() {
    try {
      const cutoffTime = Date.now() - this.retentionPolicy;
      const itemsToRemove = this.queueItems.filter(item => {
        const itemTime = new Date(item.timestamp).getTime();
        return itemTime < cutoffTime && item.status === 'completed';
      });
      
      for (const item of itemsToRemove) {
        await this.removeQueueItem(item.id);
      }
      
      if (itemsToRemove.length > 0) {
        console.log(`Cleaned up ${itemsToRemove.length} old items`);
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const stats = {
      totalItems: this.queueItems.length,
      pendingItems: this.queueItems.filter(item => item.status === 'pending').length,
      processingItems: this.queueItems.filter(item => item.status === 'processing').length,
      completedItems: this.queueItems.filter(item => item.status === 'completed').length,
      failedItems: this.queueItems.filter(item => item.status === 'failed').length,
      currentBufferSize: this.currentBufferSize,
      maxBufferSize: this.maxBufferSize,
      bufferUsagePercent: (this.currentBufferSize / this.maxBufferSize * 100).toFixed(2),
      isProcessing: this.processingQueue
    };
    
    return stats;
  }

  /**
   * Get queue items with filtering
   */
  getQueueItems(filter = {}) {
    let items = this.queueItems;
    
    if (filter.status) {
      items = items.filter(item => item.status === filter.status);
    }
    
    if (filter.consultationId) {
      items = items.filter(item => item.metadata.consultationId === filter.consultationId);
    }
    
    if (filter.priority) {
      items = items.filter(item => item.metadata.priority === filter.priority);
    }
    
    return items;
  }

  /**
   * Clear completed items
   */
  async clearCompletedItems() {
    try {
      const completedItems = this.queueItems.filter(item => item.status === 'completed');
      
      for (const item of completedItems) {
        await this.removeQueueItem(item.id);
      }
      
      console.log(`Cleared ${completedItems.length} completed items`);
      
    } catch (error) {
      console.error('Failed to clear completed items:', error);
    }
  }

  /**
   * Force process queue
   */
  async forceProcessQueue() {
    if (this.processingQueue) {
      console.log('Queue processing already in progress');
      return;
    }
    
    await this.processQueue();
  }

  /**
   * Destroy buffer and clean up resources
   */
  async destroy() {
    try {
      // Clear all callbacks
      this.callbacks.clear();
      
      // Close database connection
      if (this.db) {
        this.db.close();
      }
      
      // Clear memory
      this.queueItems = [];
      this.currentBufferSize = 0;
      
      console.log('OfflineTranscriptionBuffer destroyed');
      
    } catch (error) {
      console.error('Error destroying buffer:', error);
    }
  }
}

// Export singleton instance
export const offlineTranscriptionBuffer = new OfflineTranscriptionBuffer();