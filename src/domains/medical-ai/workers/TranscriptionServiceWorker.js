/**
 * Transcription Service Worker
 * 
 * Background processing independent of main thread for transcription resilience
 */

// Service Worker for transcription background processing
class TranscriptionServiceWorker {
  constructor() {
    this.isRegistered = false;
    this.serviceWorker = null;
    this.messageQueue = [];
    this.callbacks = new Map();
    this.retryQueue = [];
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.processingState = 'idle';
    this.backgroundTasks = new Map();
    this.syncTasks = new Map();
    this.taskId = 0;
    
    this.initialize();
  }

  /**
   * Initialize service worker
   */
  async initialize() {
    try {
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker();
      } else {
        console.warn('Service Worker not supported, using fallback');
        await this.initializeFallback();
      }
    } catch (error) {
      console.error('Failed to initialize TranscriptionServiceWorker:', error);
      await this.initializeFallback();
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw-transcription.js', {
        scope: '/transcription/'
      });

      console.log('Transcription Service Worker registered:', registration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      // Get the active service worker
      this.serviceWorker = registration.active || registration.waiting || registration.installing;

      if (this.serviceWorker) {
        this.isRegistered = true;
        this.setupMessageHandler();
        
        // Send initialization message
        this.sendMessage({
          type: 'INIT',
          config: {
            maxRetries: this.maxRetries,
            retryDelay: this.retryDelay
          }
        });
      } else {
        throw new Error('Service worker not available');
      }

    } catch (error) {
      console.error('Failed to register service worker:', error);
      throw error;
    }
  }

  /**
   * Initialize fallback mode
   */
  async initializeFallback() {
    console.log('Initializing fallback mode for background processing');
    
    // Use Web Workers as fallback
    try {
      if ('Worker' in window) {
        this.serviceWorker = new Worker('/js/transcription-worker.js');
        this.isRegistered = true;
        this.setupMessageHandler();
        
        console.log('Fallback worker initialized');
      } else {
        console.warn('Web Workers not supported, using main thread');
        this.isRegistered = false;
      }
    } catch (error) {
      console.error('Fallback initialization failed:', error);
      this.isRegistered = false;
    }
  }

  /**
   * Setup message handler
   */
  setupMessageHandler() {
    try {
      if (this.serviceWorker) {
        this.serviceWorker.addEventListener('message', (event) => {
          this.handleMessage(event);
        });
      }
    } catch (error) {
      console.error('Error setting up message handler:', error);
    }
  }

  /**
   * Handle messages from service worker
   */
  handleMessage(event) {
    try {
      const message = event.data;
      
      switch (message.type) {
        case 'TASK_COMPLETED':
          this.handleTaskCompleted(message);
          break;
        case 'TASK_FAILED':
          this.handleTaskFailed(message);
          break;
        case 'SYNC_COMPLETED':
          this.handleSyncCompleted(message);
          break;
        case 'RETRY_NEEDED':
          this.handleRetryNeeded(message);
          break;
        case 'PROGRESS_UPDATE':
          this.handleProgressUpdate(message);
          break;
        case 'ERROR':
          this.handleError(message);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Send message to service worker
   */
  sendMessage(message) {
    try {
      if (this.isRegistered && this.serviceWorker) {
        this.serviceWorker.postMessage(message);
      } else {
        // Queue message for later
        this.messageQueue.push(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.sendMessage(message);
      }
    } catch (error) {
      console.error('Error processing message queue:', error);
    }
  }

  /**
   * Process transcription in background
   */
  async processTranscriptionBackground(audioData, options = {}) {
    try {
      const taskId = this.generateTaskId();
      
      const task = {
        id: taskId,
        type: 'TRANSCRIPTION',
        audioData: audioData,
        options: {
          ...options,
          sessionId: options.sessionId || 'default',
          timestamp: Date.now(),
          priority: options.priority || 'normal'
        },
        retryCount: 0,
        createdAt: new Date()
      };

      this.backgroundTasks.set(taskId, task);

      // Send to service worker
      this.sendMessage({
        type: 'PROCESS_TRANSCRIPTION',
        task: task
      });

      return taskId;

    } catch (error) {
      console.error('Error processing transcription in background:', error);
      throw error;
    }
  }

  /**
   * Process audio chunk in background
   */
  async processAudioChunkBackground(chunkData, options = {}) {
    try {
      const taskId = this.generateTaskId();
      
      const task = {
        id: taskId,
        type: 'AUDIO_CHUNK',
        chunkData: chunkData,
        options: {
          ...options,
          chunkId: options.chunkId || `chunk_${taskId}`,
          timestamp: Date.now(),
          priority: options.priority || 'normal'
        },
        retryCount: 0,
        createdAt: new Date()
      };

      this.backgroundTasks.set(taskId, task);

      // Send to service worker
      this.sendMessage({
        type: 'PROCESS_AUDIO_CHUNK',
        task: task
      });

      return taskId;

    } catch (error) {
      console.error('Error processing audio chunk in background:', error);
      throw error;
    }
  }

  /**
   * Sync offline data in background
   */
  async syncOfflineDataBackground(syncData, options = {}) {
    try {
      const taskId = this.generateTaskId();
      
      const task = {
        id: taskId,
        type: 'OFFLINE_SYNC',
        syncData: syncData,
        options: {
          ...options,
          syncType: options.syncType || 'full',
          timestamp: Date.now(),
          priority: options.priority || 'high'
        },
        retryCount: 0,
        createdAt: new Date()
      };

      this.syncTasks.set(taskId, task);

      // Send to service worker
      this.sendMessage({
        type: 'SYNC_OFFLINE_DATA',
        task: task
      });

      return taskId;

    } catch (error) {
      console.error('Error syncing offline data in background:', error);
      throw error;
    }
  }

  /**
   * Schedule background sync
   */
  async scheduleBackgroundSync(syncTag, syncData) {
    try {
      if (!this.isRegistered) {
        console.warn('Service worker not registered, cannot schedule background sync');
        return false;
      }

      // Register background sync
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await registration.sync.register(syncTag);
        
        // Store sync data
        this.storeSyncData(syncTag, syncData);
        
        console.log('Background sync scheduled:', syncTag);
        return true;
      } else {
        console.warn('Background sync not supported');
        return false;
      }

    } catch (error) {
      console.error('Error scheduling background sync:', error);
      return false;
    }
  }

  /**
   * Store sync data
   */
  storeSyncData(syncTag, syncData) {
    try {
      const data = {
        tag: syncTag,
        data: syncData,
        timestamp: Date.now()
      };

      localStorage.setItem(`sync_${syncTag}`, JSON.stringify(data));
      
    } catch (error) {
      console.error('Error storing sync data:', error);
    }
  }

  /**
   * Get sync data
   */
  getSyncData(syncTag) {
    try {
      const storedData = localStorage.getItem(`sync_${syncTag}`);
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error getting sync data:', error);
      return null;
    }
  }

  /**
   * Handle task completed
   */
  handleTaskCompleted(message) {
    try {
      const taskId = message.taskId;
      const result = message.result;
      
      // Remove from active tasks
      this.backgroundTasks.delete(taskId);
      this.syncTasks.delete(taskId);
      
      // Trigger callback
      this.triggerCallback('taskCompleted', {
        taskId: taskId,
        result: result
      });
      
      console.log('Background task completed:', taskId);
      
    } catch (error) {
      console.error('Error handling task completed:', error);
    }
  }

  /**
   * Handle task failed
   */
  handleTaskFailed(message) {
    try {
      const taskId = message.taskId;
      const error = message.error;
      const task = this.backgroundTasks.get(taskId) || this.syncTasks.get(taskId);
      
      if (task) {
        task.retryCount++;
        task.lastError = error;
        
        // Check if should retry
        if (task.retryCount < this.maxRetries) {
          this.scheduleRetry(task);
        } else {
          // Max retries reached, remove task
          this.backgroundTasks.delete(taskId);
          this.syncTasks.delete(taskId);
          
          // Trigger callback
          this.triggerCallback('taskFailed', {
            taskId: taskId,
            error: error,
            retryCount: task.retryCount
          });
          
          console.error('Background task failed permanently:', taskId, error);
        }
      }
      
    } catch (error) {
      console.error('Error handling task failed:', error);
    }
  }

  /**
   * Handle sync completed
   */
  handleSyncCompleted(message) {
    try {
      const syncTag = message.syncTag;
      const result = message.result;
      
      // Clean up sync data
      localStorage.removeItem(`sync_${syncTag}`);
      
      // Trigger callback
      this.triggerCallback('syncCompleted', {
        syncTag: syncTag,
        result: result
      });
      
      console.log('Background sync completed:', syncTag);
      
    } catch (error) {
      console.error('Error handling sync completed:', error);
    }
  }

  /**
   * Handle retry needed
   */
  handleRetryNeeded(message) {
    try {
      const taskId = message.taskId;
      const task = this.backgroundTasks.get(taskId) || this.syncTasks.get(taskId);
      
      if (task) {
        this.scheduleRetry(task);
      }
      
    } catch (error) {
      console.error('Error handling retry needed:', error);
    }
  }

  /**
   * Handle progress update
   */
  handleProgressUpdate(message) {
    try {
      const taskId = message.taskId;
      const progress = message.progress;
      
      // Trigger callback
      this.triggerCallback('progressUpdate', {
        taskId: taskId,
        progress: progress
      });
      
    } catch (error) {
      console.error('Error handling progress update:', error);
    }
  }

  /**
   * Handle error
   */
  handleError(message) {
    try {
      const error = message.error;
      const context = message.context;
      
      console.error('Service worker error:', error, context);
      
      // Trigger callback
      this.triggerCallback('error', {
        error: error,
        context: context
      });
      
    } catch (error) {
      console.error('Error handling error:', error);
    }
  }

  /**
   * Schedule retry
   */
  scheduleRetry(task) {
    try {
      const delay = this.retryDelay * Math.pow(2, task.retryCount - 1); // Exponential backoff
      
      setTimeout(() => {
        // Resend task
        const messageType = {
          'TRANSCRIPTION': 'PROCESS_TRANSCRIPTION',
          'AUDIO_CHUNK': 'PROCESS_AUDIO_CHUNK',
          'OFFLINE_SYNC': 'SYNC_OFFLINE_DATA'
        }[task.type];
        
        if (messageType) {
          this.sendMessage({
            type: messageType,
            task: task
          });
        }
      }, delay);
      
      console.log(`Scheduled retry for task ${task.id} in ${delay}ms`);
      
    } catch (error) {
      console.error('Error scheduling retry:', error);
    }
  }

  /**
   * Generate task ID
   */
  generateTaskId() {
    return `task_${++this.taskId}_${Date.now()}`;
  }

  /**
   * Get background task status
   */
  getBackgroundTaskStatus(taskId) {
    try {
      const task = this.backgroundTasks.get(taskId) || this.syncTasks.get(taskId);
      
      if (task) {
        return {
          id: task.id,
          type: task.type,
          status: 'processing',
          retryCount: task.retryCount,
          createdAt: task.createdAt,
          lastError: task.lastError
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting background task status:', error);
      return null;
    }
  }

  /**
   * Get all background tasks
   */
  getAllBackgroundTasks() {
    try {
      const tasks = [];
      
      // Add background tasks
      for (const [, task] of this.backgroundTasks) {
        tasks.push({
          id: task.id,
          type: task.type,
          status: 'processing',
          retryCount: task.retryCount,
          createdAt: task.createdAt,
          lastError: task.lastError
        });
      }
      
      // Add sync tasks
      for (const [, task] of this.syncTasks) {
        tasks.push({
          id: task.id,
          type: task.type,
          status: 'syncing',
          retryCount: task.retryCount,
          createdAt: task.createdAt,
          lastError: task.lastError
        });
      }
      
      return tasks;
      
    } catch (error) {
      console.error('Error getting all background tasks:', error);
      return [];
    }
  }

  /**
   * Cancel background task
   */
  cancelBackgroundTask(taskId) {
    try {
      // Remove from active tasks
      this.backgroundTasks.delete(taskId);
      this.syncTasks.delete(taskId);
      
      // Send cancellation message
      this.sendMessage({
        type: 'CANCEL_TASK',
        taskId: taskId
      });
      
      console.log('Background task cancelled:', taskId);
      
      return true;
      
    } catch (error) {
      console.error('Error cancelling background task:', error);
      return false;
    }
  }

  /**
   * Cancel all background tasks
   */
  cancelAllBackgroundTasks() {
    try {
      const taskIds = [
        ...this.backgroundTasks.keys(),
        ...this.syncTasks.keys()
      ];
      
      // Clear all tasks
      this.backgroundTasks.clear();
      this.syncTasks.clear();
      
      // Send cancellation message
      this.sendMessage({
        type: 'CANCEL_ALL_TASKS'
      });
      
      console.log(`Cancelled ${taskIds.length} background tasks`);
      
      return taskIds.length;
      
    } catch (error) {
      console.error('Error cancelling all background tasks:', error);
      return 0;
    }
  }

  /**
   * Check if background processing is available
   */
  isBackgroundProcessingAvailable() {
    return this.isRegistered && this.serviceWorker !== null;
  }

  /**
   * Get background processing statistics
   */
  getBackgroundProcessingStats() {
    try {
      return {
        isRegistered: this.isRegistered,
        isAvailable: this.isBackgroundProcessingAvailable(),
        activeBackgroundTasks: this.backgroundTasks.size,
        activeSyncTasks: this.syncTasks.size,
        totalActiveTasks: this.backgroundTasks.size + this.syncTasks.size,
        queuedMessages: this.messageQueue.length,
        processingState: this.processingState
      };
    } catch (error) {
      console.error('Error getting background processing stats:', error);
      return {
        isRegistered: false,
        isAvailable: false,
        activeBackgroundTasks: 0,
        activeSyncTasks: 0,
        totalActiveTasks: 0,
        queuedMessages: 0,
        processingState: 'error'
      };
    }
  }

  /**
   * Register callback
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
   * Trigger callback
   */
  triggerCallback(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in service worker callback:', error);
        }
      });
    }
  }

  /**
   * Update service worker
   */
  async updateServiceWorker() {
    try {
      if (!this.isRegistered) return false;
      
      const registration = await navigator.serviceWorker.getRegistration('/transcription/');
      
      if (registration) {
        await registration.update();
        console.log('Service worker updated');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error updating service worker:', error);
      return false;
    }
  }

  /**
   * Unregister service worker
   */
  async unregisterServiceWorker() {
    try {
      if (!this.isRegistered) return false;
      
      const registration = await navigator.serviceWorker.getRegistration('/transcription/');
      
      if (registration) {
        await registration.unregister();
        this.isRegistered = false;
        this.serviceWorker = null;
        console.log('Service worker unregistered');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error unregistering service worker:', error);
      return false;
    }
  }

  /**
   * Destroy and cleanup
   */
  async destroy() {
    try {
      // Cancel all background tasks
      this.cancelAllBackgroundTasks();
      
      // Clear message queue
      this.messageQueue = [];
      
      // Clear callbacks
      this.callbacks.clear();
      
      // Clean up service worker
      if (this.isRegistered) {
        await this.unregisterServiceWorker();
      }
      
      console.log('TranscriptionServiceWorker destroyed');
      
    } catch (error) {
      console.error('Error destroying service worker:', error);
    }
  }
}

// Create service worker script content
const serviceWorkerScript = `
// Service Worker for transcription background processing
const CACHE_NAME = 'transcription-cache-v1';
const API_CACHE_NAME = 'transcription-api-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Transcription Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/js/transcription-worker.js',
        '/api/transcription/health'
      ]);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Transcription Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  const message = event.data;
  
  switch (message.type) {
    case 'INIT':
      handleInit(message);
      break;
    case 'PROCESS_TRANSCRIPTION':
      handleProcessTranscription(message);
      break;
    case 'PROCESS_AUDIO_CHUNK':
      handleProcessAudioChunk(message);
      break;
    case 'SYNC_OFFLINE_DATA':
      handleSyncOfflineData(message);
      break;
    case 'CANCEL_TASK':
      handleCancelTask(message);
      break;
    case 'CANCEL_ALL_TASKS':
      handleCancelAllTasks(message);
      break;
    default:
      console.warn('Unknown message type:', message.type);
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'transcription-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Fetch event for offline support
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/transcription/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(event.request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          // Return cached response if available
          return cache.match(event.request);
        });
      })
    );
  }
});

// Initialize service worker
function handleInit(message) {
  console.log('Service worker initialized with config:', message.config);
  
  self.postMessage({
    type: 'INIT_COMPLETE',
    config: message.config
  });
}

// Process transcription
async function handleProcessTranscription(message) {
  try {
    const task = message.task;
    console.log('Processing transcription:', task.id);
    
    // Send progress update
    self.postMessage({
      type: 'PROGRESS_UPDATE',
      taskId: task.id,
      progress: 0
    });
    
    // Process the transcription
    const result = await processTranscription(task);
    
    // Send completion message
    self.postMessage({
      type: 'TASK_COMPLETED',
      taskId: task.id,
      result: result
    });
    
  } catch (error) {
    console.error('Error processing transcription:', error);
    
    self.postMessage({
      type: 'TASK_FAILED',
      taskId: message.task.id,
      error: error.message
    });
  }
}

// Process audio chunk
async function handleProcessAudioChunk(message) {
  try {
    const task = message.task;
    console.log('Processing audio chunk:', task.id);
    
    // Send progress update
    self.postMessage({
      type: 'PROGRESS_UPDATE',
      taskId: task.id,
      progress: 0
    });
    
    // Process the audio chunk
    const result = await processAudioChunk(task);
    
    // Send completion message
    self.postMessage({
      type: 'TASK_COMPLETED',
      taskId: task.id,
      result: result
    });
    
  } catch (error) {
    console.error('Error processing audio chunk:', error);
    
    self.postMessage({
      type: 'TASK_FAILED',
      taskId: message.task.id,
      error: error.message
    });
  }
}

// Sync offline data
async function handleSyncOfflineData(message) {
  try {
    const task = message.task;
    console.log('Syncing offline data:', task.id);
    
    // Send progress update
    self.postMessage({
      type: 'PROGRESS_UPDATE',
      taskId: task.id,
      progress: 0
    });
    
    // Sync the data
    const result = await syncOfflineData(task);
    
    // Send completion message
    self.postMessage({
      type: 'SYNC_COMPLETED',
      taskId: task.id,
      syncTag: task.options.syncType,
      result: result
    });
    
  } catch (error) {
    console.error('Error syncing offline data:', error);
    
    self.postMessage({
      type: 'TASK_FAILED',
      taskId: message.task.id,
      error: error.message
    });
  }
}

// Cancel task
function handleCancelTask(message) {
  console.log('Cancelling task:', message.taskId);
  // Implementation depends on specific task tracking
}

// Cancel all tasks
function handleCancelAllTasks(message) {
  console.log('Cancelling all tasks');
  // Implementation depends on specific task tracking
}

// Background sync
async function doBackgroundSync() {
  try {
    console.log('Performing background sync...');
    
    // Get sync data from IndexedDB or localStorage
    const syncData = await getSyncData();
    
    if (syncData && syncData.length > 0) {
      for (const item of syncData) {
        await syncDataItem(item);
      }
      
      // Clear sync data after successful sync
      await clearSyncData();
    }
    
    console.log('Background sync completed');
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Process transcription implementation
async function processTranscription(task) {
  // Implementation would depend on the specific transcription service
  // This is a placeholder
  return {
    taskId: task.id,
    transcription: 'Mock transcription result',
    confidence: 0.95,
    timestamp: new Date().toISOString()
  };
}

// Process audio chunk implementation
async function processAudioChunk(task) {
  // Implementation would depend on the specific audio processing
  // This is a placeholder
  return {
    taskId: task.id,
    chunkId: task.options.chunkId,
    processed: true,
    timestamp: new Date().toISOString()
  };
}

// Sync offline data implementation
async function syncOfflineData(task) {
  // Implementation would depend on the specific sync requirements
  // This is a placeholder
  return {
    taskId: task.id,
    syncType: task.options.syncType,
    itemsSynced: 0,
    timestamp: new Date().toISOString()
  };
}

// Get sync data from storage
async function getSyncData() {
  // Implementation depends on storage mechanism
  return [];
}

// Sync individual data item
async function syncDataItem(item) {
  // Implementation depends on sync mechanism
  return true;
}

// Clear sync data
async function clearSyncData() {
  // Implementation depends on storage mechanism
  return true;
}
`;

// Export both the class and the script
export { TranscriptionServiceWorker, serviceWorkerScript };

// Export singleton instance
export const transcriptionServiceWorker = new TranscriptionServiceWorker();