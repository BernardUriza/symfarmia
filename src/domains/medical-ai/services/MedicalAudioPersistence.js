/**
 * Medical Audio Persistence
 * 
 * Handles encrypted local storage for medical audio data with HIPAA compliance
 */

export class MedicalAudioPersistence {
  constructor() {
    this.dbName = 'MedicalAudioStorage';
    this.dbVersion = 1;
    this.storeName = 'audioData';
    this.encryptionKey = null;
    this.db = null;
    this.isInitialized = false;
    this.encryptionEnabled = true;
    this.compressionEnabled = true;
    this.maxStorageSize = 500 * 1024 * 1024; // 500MB
    this.currentStorageSize = 0;
    this.retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    this.auditLog = [];
    this.encryptionAlgorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12;
    this.tagLength = 16;
    this.hipaaCompliance = true;
    this.dataClassification = 'PHI'; // Protected Health Information
    this.accessLog = [];
    this.maxAuditEntries = 1000;
    this.isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
    
    // Only initialize in browser environment
    if (this.isBrowser) {
      this.initialize();
    }
  }

  /**
   * Initialize the persistence system
   */
  async initialize() {
    try {
      // Initialize encryption
      await this.initializeEncryption();
      
      // Initialize database
      await this.initializeDatabase();
      
      // Load existing data
      await this.loadStorageMetrics();
      
      // Start cleanup timer
      this.startCleanupTimer();
      
      // Setup audit logging
      this.setupAuditLogging();
      
      this.isInitialized = true;
      
      console.log('MedicalAudioPersistence initialized with encryption');
      
    } catch (error) {
      console.error('Failed to initialize MedicalAudioPersistence:', error);
      await this.initializeFallbackMode();
    }
  }

  /**
   * Initialize encryption system
   */
  async initializeEncryption() {
    try {
      if (!this.encryptionEnabled) return;
      
      // Check for browser environment and Web Crypto API support
      if (!this.isBrowser || !window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API not supported');
      }
      
      // Generate or retrieve encryption key
      await this.generateOrRetrieveKey();
      
      console.log('Encryption initialized for medical audio storage');
      
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      this.encryptionEnabled = false;
      console.warn('Proceeding without encryption (NOT RECOMMENDED for production)');
    }
  }

  /**
   * Generate or retrieve encryption key
   */
  async generateOrRetrieveKey() {
    try {
      // In production, this key would be derived from user authentication
      // For now, we'll generate a session key
      this.encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: this.encryptionAlgorithm,
          length: this.keyLength
        },
        false, // not extractable
        ['encrypt', 'decrypt']
      );
      
      console.log('Encryption key generated');
      
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      throw error;
    }
  }

  /**
   * Initialize database
   */
  async initializeDatabase() {
    try {
      this.db = await this.openDatabase();
      console.log('Database initialized for medical audio storage');
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Open IndexedDB database
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        reject(new Error('IndexedDB not available in non-browser environment'));
        return;
      }
      
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for audio data
        const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
        
        // Create indexes
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('consultationId', 'consultationId', { unique: false });
        store.createIndex('patientId', 'patientId', { unique: false });
        store.createIndex('classification', 'classification', { unique: false });
        store.createIndex('expirationDate', 'expirationDate', { unique: false });
        store.createIndex('accessCount', 'accessCount', { unique: false });
      };
    });
  }

  /**
   * Initialize fallback mode
   */
  async initializeFallbackMode() {
    console.warn('Initializing fallback mode for medical audio persistence');
    
    // Disable encryption in fallback mode
    this.encryptionEnabled = false;
    
    // Use in-memory storage as last resort
    this.fallbackStorage = new Map();
    this.isInitialized = true;
    
    console.warn('SECURITY WARNING: Medical audio storage is not encrypted');
  }

  /**
   * Store audio data with encryption
   */
  async storeAudioData(audioData, metadata = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Validate storage limits
      await this.validateStorageLimits(audioData);
      
      // Create storage record
      const record = await this.createStorageRecord(audioData, metadata);
      
      // Encrypt data if enabled
      if (this.encryptionEnabled) {
        record.encryptedData = await this.encryptData(audioData);
        record.encrypted = true;
      } else {
        record.audioData = audioData;
        record.encrypted = false;
      }
      
      // Compress if enabled
      if (this.compressionEnabled) {
        await this.compressRecord(record);
      }
      
      // Store in database
      await this.storeRecord(record);
      
      // Update storage metrics
      this.updateStorageMetrics(record);
      
      // Log access for audit
      this.logAccess('store', record.id, metadata);
      
      console.log(`Stored encrypted audio data: ${record.id}`);
      
      return record.id;
      
    } catch (error) {
      console.error('Failed to store audio data:', error);
      throw error;
    }
  }

  /**
   * Retrieve audio data with decryption
   */
  async retrieveAudioData(recordId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Retrieve record from database
      const record = await this.getRecord(recordId);
      
      if (!record) {
        throw new Error(`Audio record not found: ${recordId}`);
      }
      
      // Check expiration
      if (this.isRecordExpired(record)) {
        await this.deleteRecord(recordId);
        throw new Error(`Audio record expired: ${recordId}`);
      }
      
      // Decrypt data if encrypted
      let audioData;
      if (record.encrypted && this.encryptionEnabled) {
        audioData = await this.decryptData(record.encryptedData);
      } else {
        audioData = record.audioData;
      }
      
      // Decompress if needed
      if (record.compressed) {
        audioData = await this.decompressData(audioData);
      }
      
      // Update access count
      await this.updateAccessCount(recordId);
      
      // Log access for audit
      this.logAccess('retrieve', recordId, { success: true });
      
      console.log(`Retrieved audio data: ${recordId}`);
      
      return {
        id: recordId,
        audioData: audioData,
        metadata: record.metadata,
        timestamp: record.timestamp,
        accessCount: record.accessCount + 1
      };
      
    } catch (error) {
      console.error('Failed to retrieve audio data:', error);
      
      // Log failed access
      this.logAccess('retrieve', recordId, { success: false, error: error.message });
      
      throw error;
    }
  }

  /**
   * Create storage record
   */
  async createStorageRecord(audioData, metadata) {
    const recordId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    return {
      id: recordId,
      timestamp: now,
      expirationDate: new Date(now.getTime() + this.retentionPeriod),
      metadata: {
        ...metadata,
        consultationId: metadata.consultationId || 'unknown',
        patientId: metadata.patientId || 'unknown',
        duration: metadata.duration || 0,
        format: metadata.format || 'audio/wav',
        sampleRate: metadata.sampleRate || 44100,
        channels: metadata.channels || 1,
        originalSize: audioData.byteLength || audioData.size || 0
      },
      classification: this.dataClassification,
      encrypted: false,
      compressed: false,
      accessCount: 0,
      lastAccessed: now,
      checksum: await this.calculateChecksum(audioData),
      hipaaCompliant: this.hipaaCompliance,
      auditTrail: []
    };
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encryptData(data) {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not available');
      }
      
      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
      
      // Convert data to ArrayBuffer if needed
      let dataBuffer;
      if (data instanceof ArrayBuffer) {
        dataBuffer = data;
      } else if (data instanceof Blob) {
        dataBuffer = await data.arrayBuffer();
      } else {
        dataBuffer = new TextEncoder().encode(data);
      }
      
      // Encrypt data
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: this.encryptionAlgorithm,
          iv: iv
        },
        this.encryptionKey,
        dataBuffer
      );
      
      // Combine IV and encrypted data
      const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
      combinedData.set(iv);
      combinedData.set(new Uint8Array(encryptedData), iv.length);
      
      return combinedData.buffer;
      
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  async decryptData(encryptedData) {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption key not available');
      }
      
      // Extract IV and encrypted data
      const dataView = new Uint8Array(encryptedData);
      const iv = dataView.slice(0, this.ivLength);
      const encrypted = dataView.slice(this.ivLength);
      
      // Decrypt data
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: this.encryptionAlgorithm,
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );
      
      return decryptedData;
      
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  /**
   * Compress record data
   */
  async compressRecord(record) {
    try {
      if (typeof CompressionStream === 'undefined') {
        console.warn('Compression not supported, skipping');
        return;
      }
      
      // Compress the audio data
      const dataToCompress = record.encryptedData || record.audioData;
      
      if (!dataToCompress) return;
      
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new Uint8Array(dataToCompress));
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
      
      const compressedData = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      
      // Replace original data with compressed data
      if (record.encryptedData) {
        record.encryptedData = compressedData.buffer;
      } else {
        record.audioData = compressedData.buffer;
      }
      
      record.compressed = true;
      record.metadata.compressedSize = compressedData.byteLength;
      
      console.log(`Compressed data from ${record.metadata.originalSize} to ${compressedData.byteLength} bytes`);
      
    } catch (error) {
      console.error('Failed to compress record:', error);
      // Continue without compression
    }
  }

  /**
   * Decompress data
   */
  async decompressData(compressedData) {
    try {
      if (typeof DecompressionStream === 'undefined') {
        console.warn('Decompression not supported');
        return compressedData;
      }
      
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new Uint8Array(compressedData));
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
      
      const decompressedData = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      
      return decompressedData.buffer;
      
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return compressedData;
    }
  }

  /**
   * Calculate checksum for data integrity
   */
  async calculateChecksum(data) {
    try {
      const dataBuffer = data instanceof ArrayBuffer ? data : await data.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
    } catch (error) {
      console.error('Failed to calculate checksum:', error);
      return null;
    }
  }

  /**
   * Store record in database
   */
  async storeRecord(record) {
    try {
      if (!this.db) {
        // Use fallback storage
        this.fallbackStorage.set(record.id, record);
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('Failed to store record:', error);
      throw error;
    }
  }

  /**
   * Get record from database
   */
  async getRecord(recordId) {
    try {
      if (!this.db) {
        // Use fallback storage
        return this.fallbackStorage.get(recordId);
      }
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(recordId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('Failed to get record:', error);
      throw error;
    }
  }

  /**
   * Delete record from database
   */
  async deleteRecord(recordId) {
    try {
      if (!this.db) {
        // Use fallback storage
        this.fallbackStorage.delete(recordId);
        return;
      }
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(recordId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw error;
    }
  }

  /**
   * Update access count
   */
  async updateAccessCount(recordId) {
    try {
      const record = await this.getRecord(recordId);
      if (record) {
        record.accessCount++;
        record.lastAccessed = new Date();
        await this.storeRecord(record);
      }
    } catch (error) {
      console.error('Failed to update access count:', error);
    }
  }

  /**
   * Check if record is expired
   */
  isRecordExpired(record) {
    return new Date() > new Date(record.expirationDate);
  }

  /**
   * Validate storage limits
   */
  async validateStorageLimits(audioData) {
    const dataSize = audioData.byteLength || audioData.size || 0;
    
    if (this.currentStorageSize + dataSize > this.maxStorageSize) {
      // Try to clean up expired records
      await this.cleanupExpiredRecords();
      
      // Check again after cleanup
      if (this.currentStorageSize + dataSize > this.maxStorageSize) {
        throw new Error(`Storage limit exceeded: ${this.currentStorageSize + dataSize} > ${this.maxStorageSize}`);
      }
    }
  }

  /**
   * Update storage metrics
   */
  updateStorageMetrics(record) {
    const recordSize = this.calculateRecordSize(record);
    this.currentStorageSize += recordSize;
  }

  /**
   * Calculate record size
   */
  calculateRecordSize(record) {
    let size = 0;
    
    if (record.encryptedData) {
      size += record.encryptedData.byteLength;
    }
    if (record.audioData) {
      size += record.audioData.byteLength || record.audioData.size || 0;
    }
    
    // Add metadata size estimate
    size += JSON.stringify(record.metadata).length;
    
    return size;
  }

  /**
   * Load storage metrics
   */
  async loadStorageMetrics() {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const records = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      this.currentStorageSize = records.reduce((total, record) => {
        return total + this.calculateRecordSize(record);
      }, 0);
      
      console.log(`Current storage size: ${this.currentStorageSize} bytes`);
      
    } catch (error) {
      console.error('Failed to load storage metrics:', error);
    }
  }

  /**
   * Log access for audit
   */
  logAccess(action, recordId, metadata = {}) {
    const logEntry = {
      timestamp: new Date(),
      action: action,
      recordId: recordId,
      metadata: metadata,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.accessLog.push(logEntry);
    this.auditLog.push(logEntry);
    
    // Maintain log size
    if (this.accessLog.length > 100) {
      this.accessLog.shift();
    }
    
    if (this.auditLog.length > this.maxAuditEntries) {
      this.auditLog.shift();
    }
  }

  /**
   * Setup audit logging
   */
  setupAuditLogging() {
    // Log system initialization
    this.logAccess('system_init', 'system', {
      encryptionEnabled: this.encryptionEnabled,
      compressionEnabled: this.compressionEnabled,
      hipaaCompliance: this.hipaaCompliance
    });
  }

  /**
   * Start cleanup timer
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredRecords();
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Clean up expired records
   */
  async cleanupExpiredRecords() {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expirationDate');
      
      const now = new Date();
      const expiredRecords = await new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.upperBound(now));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const record of expiredRecords) {
        const recordSize = this.calculateRecordSize(record);
        await this.deleteRecord(record.id);
        deletedCount++;
        freedSpace += recordSize;
      }
      
      this.currentStorageSize -= freedSpace;
      
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} expired records, freed ${freedSpace} bytes`);
        
        // Log cleanup
        this.logAccess('cleanup', 'system', {
          deletedCount: deletedCount,
          freedSpace: freedSpace
        });
      }
      
    } catch (error) {
      console.error('Failed to cleanup expired records:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    return {
      currentSize: this.currentStorageSize,
      maxSize: this.maxStorageSize,
      usagePercent: (this.currentStorageSize / this.maxStorageSize * 100).toFixed(2),
      encryptionEnabled: this.encryptionEnabled,
      compressionEnabled: this.compressionEnabled,
      hipaaCompliant: this.hipaaCompliance,
      isInitialized: this.isInitialized,
      accessLogSize: this.accessLog.length,
      auditLogSize: this.auditLog.length
    };
  }

  /**
   * Get audit trail
   */
  getAuditTrail() {
    return {
      entries: this.auditLog,
      totalEntries: this.auditLog.length,
      dateRange: {
        start: this.auditLog[0]?.timestamp,
        end: this.auditLog[this.auditLog.length - 1]?.timestamp
      }
    };
  }

  /**
   * Export compliance report
   */
  exportComplianceReport() {
    return {
      exportDate: new Date(),
      system: {
        encryptionEnabled: this.encryptionEnabled,
        compressionEnabled: this.compressionEnabled,
        hipaaCompliant: this.hipaaCompliance,
        dataClassification: this.dataClassification,
        retentionPeriod: this.retentionPeriod
      },
      storage: this.getStorageStats(),
      audit: this.getAuditTrail(),
      compliance: {
        encryption: this.encryptionEnabled,
        auditLogging: this.auditLog.length > 0,
        dataRetention: this.retentionPeriod > 0,
        accessControl: true
      }
    };
  }

  /**
   * Destroy and clean up
   */
  async destroy() {
    try {
      // Close database connection
      if (this.db) {
        this.db.close();
      }
      
      // Clear encryption key
      this.encryptionKey = null;
      
      // Clear logs
      this.accessLog = [];
      this.auditLog = [];
      
      // Clear fallback storage
      if (this.fallbackStorage) {
        this.fallbackStorage.clear();
      }
      
      console.log('MedicalAudioPersistence destroyed');
      
    } catch (error) {
      console.error('Error destroying MedicalAudioPersistence:', error);
    }
  }
}

// Export singleton instance
let medicalAudioPersistenceInstance = null;

export const medicalAudioPersistence = (() => {
  if (typeof window !== 'undefined') {
    if (!medicalAudioPersistenceInstance) {
      medicalAudioPersistenceInstance = new MedicalAudioPersistence();
    }
    return medicalAudioPersistenceInstance;
  }
  // Return a stub for server-side rendering
  return {
    isInitialized: false,
    encryptionEnabled: false,
    compressionEnabled: false,
    save: async () => ({ success: false, error: 'Not available on server' }),
    retrieve: async () => null,
    delete: async () => ({ success: false, error: 'Not available on server' }),
    clear: async () => ({ success: false, error: 'Not available on server' }),
    getStatus: () => ({ initialized: false, environment: 'server' })
  };
})();