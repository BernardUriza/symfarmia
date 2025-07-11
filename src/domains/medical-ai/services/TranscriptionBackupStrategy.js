/**
 * Transcription Backup Strategy
 * 
 * Handles automatic backup of partial transcriptions to prevent data loss
 */

import { medicalAudioPersistence } from './MedicalAudioPersistence.js';
import { networkStatusDetector } from './NetworkStatusDetector.js';

export class TranscriptionBackupStrategy {
  constructor() {
    this.backups = new Map();
    this.backupInterval = 5000; // 5 seconds
    this.maxBackups = 50;
    this.isBackupActive = false;
    this.backupTimer = null;
    this.lastBackupTime = 0;
    this.backupQueue = [];
    this.processingBackup = false;
    this.conflictResolution = 'merge'; // merge, overwrite, prompt
    this.versionHistory = new Map();
    this.maxVersionHistory = 10;
    this.autoRecovery = true;
    this.backupCompression = true;
    this.encryptionEnabled = true;
    this.callbacks = new Map();
    this.backupMetrics = {
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      recoveredSessions: 0,
      dataLossPrevented: 0
    };
    this.currentSession = null;
    this.recoveryMode = false;
    
    this.initialize();
  }

  /**
   * Initialize backup strategy
   */
  async initialize() {
    try {
      // Check for existing backups
      await this.loadExistingBackups();
      
      // Monitor network status for backup strategy adjustment
      networkStatusDetector.onStatusChange(this.handleNetworkChange.bind(this));
      
      // Setup auto-recovery check
      await this.checkForRecovery();
      
      console.log('TranscriptionBackupStrategy initialized');
      
    } catch (error) {
      console.error('Failed to initialize TranscriptionBackupStrategy:', error);
    }
  }

  /**
   * Start backup for a transcription session
   */
  startBackup(sessionId, initialData = {}) {
    try {
      // Create new session
      this.currentSession = {
        id: sessionId,
        startTime: new Date(),
        lastBackupTime: new Date(),
        transcriptionData: initialData,
        backupCount: 0,
        status: 'active',
        consultationId: initialData.consultationId || 'unknown',
        patientId: initialData.patientId || 'unknown'
      };
      
      // Start backup timer
      this.startBackupTimer();
      
      // Initial backup
      this.performBackup();
      
      this.isBackupActive = true;
      
      console.log(`Started backup for session: ${sessionId}`);
      
      // Trigger callback
      this.triggerCallback('backupStarted', this.currentSession);
      
    } catch (error) {
      console.error('Failed to start backup:', error);
    }
  }

  /**
   * Update transcription data for backup
   */
  updateTranscriptionData(data) {
    if (!this.currentSession) return;
    
    try {
      // Update session data
      this.currentSession.transcriptionData = {
        ...this.currentSession.transcriptionData,
        ...data,
        lastUpdate: new Date()
      };
      
      // Queue backup if significant changes
      if (this.hasSignificantChanges(data)) {
        this.queueBackup();
      }
      
    } catch (error) {
      console.error('Failed to update transcription data:', error);
    }
  }

  /**
   * Check if data has significant changes
   */
  hasSignificantChanges(data) {
    if (!this.currentSession || !this.currentSession.transcriptionData) return true;
    
    const currentText = this.currentSession.transcriptionData.text || '';
    const newText = data.text || '';
    
    // Check for significant text changes
    const textChanges = Math.abs(newText.length - currentText.length);
    const significantTextChange = textChanges > 10; // 10 characters
    
    // Check for new segments
    const currentSegments = this.currentSession.transcriptionData.segments || [];
    const newSegments = data.segments || [];
    const newSegmentCount = newSegments.length - currentSegments.length;
    
    return significantTextChange || newSegmentCount > 0;
  }

  /**
   * Queue backup for processing
   */
  queueBackup() {
    if (!this.currentSession) return;
    
    // Add to queue if not already queued
    if (!this.backupQueue.includes(this.currentSession.id)) {
      this.backupQueue.push(this.currentSession.id);
    }
    
    // Process queue if not already processing
    if (!this.processingBackup) {
      this.processBackupQueue();
    }
  }

  /**
   * Start backup timer
   */
  startBackupTimer() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    this.backupTimer = setInterval(() => {
      if (this.currentSession && this.isBackupActive) {
        this.performBackup();
      }
    }, this.backupInterval);
  }

  /**
   * Perform backup
   */
  async performBackup() {
    if (!this.currentSession || this.processingBackup) return;
    
    try {
      this.processingBackup = true;
      
      // Create backup record
      const backupRecord = this.createBackupRecord();
      
      // Store backup
      await this.storeBackup(backupRecord);
      
      // Update session
      this.currentSession.lastBackupTime = new Date();
      this.currentSession.backupCount++;
      
      // Update metrics
      this.backupMetrics.totalBackups++;
      this.backupMetrics.successfulBackups++;
      
      console.log(`Backup completed for session: ${this.currentSession.id}`);
      
      // Trigger callback
      this.triggerCallback('backupCompleted', backupRecord);
      
    } catch (error) {
      console.error('Failed to perform backup:', error);
      this.backupMetrics.failedBackups++;
      
      // Trigger callback
      this.triggerCallback('backupFailed', { sessionId: this.currentSession.id, error: error.message });
    } finally {
      this.processingBackup = false;
    }
  }

  /**
   * Create backup record
   */
  createBackupRecord() {
    if (!this.currentSession) return null;
    
    const backupId = `backup_${this.currentSession.id}_${Date.now()}`;
    
    return {
      id: backupId,
      sessionId: this.currentSession.id,
      timestamp: new Date(),
      version: this.currentSession.backupCount + 1,
      transcriptionData: this.deepClone(this.currentSession.transcriptionData),
      metadata: {
        consultationId: this.currentSession.consultationId,
        patientId: this.currentSession.patientId,
        startTime: this.currentSession.startTime,
        duration: Date.now() - this.currentSession.startTime.getTime(),
        networkStatus: networkStatusDetector.getCurrentStatus(),
        backupReason: 'scheduled'
      },
      checksum: this.calculateChecksum(this.currentSession.transcriptionData),
      compressed: this.backupCompression,
      encrypted: this.encryptionEnabled,
      size: this.calculateDataSize(this.currentSession.transcriptionData)
    };
  }

  /**
   * Store backup
   */
  async storeBackup(backupRecord) {
    try {
      // Store in local storage
      await this.storeLocalBackup(backupRecord);
      
      // Store in persistent storage
      if (medicalAudioPersistence.isInitialized) {
        await this.storePersistentBackup(backupRecord);
      }
      
      // Update backup map
      this.backups.set(backupRecord.id, backupRecord);
      
      // Maintain version history
      this.updateVersionHistory(backupRecord);
      
      // Cleanup old backups
      this.cleanupOldBackups();
      
    } catch (error) {
      console.error('Failed to store backup:', error);
      throw error;
    }
  }

  /**
   * Store backup in local storage
   */
  async storeLocalBackup(backupRecord) {
    try {
      const backupData = this.backupCompression ? 
        await this.compressData(backupRecord) : 
        backupRecord;
      
      localStorage.setItem(`transcription_backup_${backupRecord.id}`, JSON.stringify(backupData));
      
    } catch (error) {
      console.error('Failed to store local backup:', error);
      throw error;
    }
  }

  /**
   * Store backup in persistent storage
   */
  async storePersistentBackup(backupRecord) {
    try {
      const backupData = JSON.stringify(backupRecord);
      const backupBlob = new Blob([backupData], { type: 'application/json' });
      
      await medicalAudioPersistence.storeAudioData(backupBlob, {
        type: 'transcription_backup',
        sessionId: backupRecord.sessionId,
        consultationId: backupRecord.metadata.consultationId,
        patientId: backupRecord.metadata.patientId,
        version: backupRecord.version
      });
      
    } catch (error) {
      console.error('Failed to store persistent backup:', error);
      // Continue with local storage only
    }
  }

  /**
   * Process backup queue
   */
  async processBackupQueue() {
    if (this.processingBackup || this.backupQueue.length === 0) return;
    
    while (this.backupQueue.length > 0) {
      const sessionId = this.backupQueue.shift();
      
      if (this.currentSession && this.currentSession.id === sessionId) {
        await this.performBackup();
      }
    }
  }

  /**
   * Load existing backups
   */
  async loadExistingBackups() {
    try {
      // Load from local storage
      await this.loadLocalBackups();
      
      // Load from persistent storage
      if (medicalAudioPersistence.isInitialized) {
        await this.loadPersistentBackups();
      }
      
      console.log(`Loaded ${this.backups.size} existing backups`);
      
    } catch (error) {
      console.error('Failed to load existing backups:', error);
    }
  }

  /**
   * Load backups from local storage
   */
  async loadLocalBackups() {
    try {
      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter(key => key.startsWith('transcription_backup_'));
      
      for (const key of backupKeys) {
        try {
          const backupData = JSON.parse(localStorage.getItem(key));
          const backupRecord = this.backupCompression ? 
            await this.decompressData(backupData) : 
            backupData;
          
          this.backups.set(backupRecord.id, backupRecord);
          this.updateVersionHistory(backupRecord);
          
        } catch (error) {
          console.error(`Failed to load backup ${key}:`, error);
          // Remove corrupted backup
          localStorage.removeItem(key);
        }
      }
      
    } catch (error) {
      console.error('Failed to load local backups:', error);
    }
  }

  /**
   * Load backups from persistent storage
   */
  async loadPersistentBackups() {
    try {
      // This would query persistent storage for backup records
      // Implementation depends on the storage system
      console.log('Loading persistent backups...');
      
    } catch (error) {
      console.error('Failed to load persistent backups:', error);
    }
  }

  /**
   * Check for recovery opportunities
   */
  async checkForRecovery() {
    try {
      if (!this.autoRecovery) return;
      
      // Find recent backups that might need recovery
      const recentBackups = Array.from(this.backups.values())
        .filter(backup => {
          const backupTime = new Date(backup.timestamp);
          const timeDiff = Date.now() - backupTime.getTime();
          return timeDiff < 60 * 60 * 1000; // Within last hour
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (recentBackups.length > 0) {
        console.log(`Found ${recentBackups.length} recent backups for potential recovery`);
        
        // Trigger recovery callback
        this.triggerCallback('recoveryAvailable', recentBackups);
      }
      
    } catch (error) {
      console.error('Failed to check for recovery:', error);
    }
  }

  /**
   * Recover from backup
   */
  async recoverFromBackup(backupId) {
    try {
      const backup = this.backups.get(backupId);
      
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      
      // Validate backup integrity
      const isValid = await this.validateBackup(backup);
      if (!isValid) {
        throw new Error(`Backup integrity check failed: ${backupId}`);
      }
      
      // Enter recovery mode
      this.recoveryMode = true;
      
      // Restore data
      const recoveredData = this.deepClone(backup.transcriptionData);
      
      // Update metrics
      this.backupMetrics.recoveredSessions++;
      this.backupMetrics.dataLossPrevented += backup.size;
      
      console.log(`Successfully recovered from backup: ${backupId}`);
      
      // Trigger callback
      this.triggerCallback('recoveryCompleted', {
        backupId: backupId,
        recoveredData: recoveredData,
        backup: backup
      });
      
      return recoveredData;
      
    } catch (error) {
      console.error('Failed to recover from backup:', error);
      
      // Trigger callback
      this.triggerCallback('recoveryFailed', {
        backupId: backupId,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Validate backup integrity
   */
  async validateBackup(backup) {
    try {
      // Check checksum
      const calculatedChecksum = this.calculateChecksum(backup.transcriptionData);
      if (calculatedChecksum !== backup.checksum) {
        console.error('Backup checksum mismatch');
        return false;
      }
      
      // Check required fields
      const requiredFields = ['id', 'sessionId', 'timestamp', 'transcriptionData'];
      for (const field of requiredFields) {
        if (!backup[field]) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('Error validating backup:', error);
      return false;
    }
  }

  /**
   * Handle network changes
   */
  handleNetworkChange(networkStatus) {
    try {
      // Adjust backup frequency based on network quality
      if (networkStatus.quality === 'poor' || networkStatus.quality === 'offline') {
        // Increase backup frequency for poor connections
        this.backupInterval = 3000; // 3 seconds
      } else {
        // Standard backup frequency
        this.backupInterval = 5000; // 5 seconds
      }
      
      // Restart timer with new interval
      if (this.isBackupActive) {
        this.startBackupTimer();
      }
      
      console.log(`Adjusted backup interval to ${this.backupInterval}ms for ${networkStatus.quality} network`);
      
    } catch (error) {
      console.error('Error handling network change:', error);
    }
  }

  /**
   * Stop backup
   */
  stopBackup() {
    try {
      if (this.backupTimer) {
        clearInterval(this.backupTimer);
        this.backupTimer = null;
      }
      
      // Final backup
      if (this.currentSession) {
        this.performBackup();
        this.currentSession.status = 'completed';
      }
      
      this.isBackupActive = false;
      
      console.log('Backup stopped');
      
      // Trigger callback
      this.triggerCallback('backupStopped', this.currentSession);
      
    } catch (error) {
      console.error('Error stopping backup:', error);
    }
  }

  /**
   * Update version history
   */
  updateVersionHistory(backupRecord) {
    const sessionId = backupRecord.sessionId;
    
    if (!this.versionHistory.has(sessionId)) {
      this.versionHistory.set(sessionId, []);
    }
    
    const history = this.versionHistory.get(sessionId);
    history.push(backupRecord);
    
    // Maintain history size
    if (history.length > this.maxVersionHistory) {
      history.shift();
    }
  }

  /**
   * Clean up old backups
   */
  cleanupOldBackups() {
    try {
      const backupArray = Array.from(this.backups.values());
      
      if (backupArray.length <= this.maxBackups) return;
      
      // Sort by timestamp
      backupArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Remove oldest backups
      const toRemove = backupArray.slice(0, backupArray.length - this.maxBackups);
      
      for (const backup of toRemove) {
        this.backups.delete(backup.id);
        localStorage.removeItem(`transcription_backup_${backup.id}`);
      }
      
      console.log(`Cleaned up ${toRemove.length} old backups`);
      
    } catch (error) {
      console.error('Error cleaning up backups:', error);
    }
  }

  /**
   * Deep clone object
   */
  deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error('Error cloning object:', error);
      return obj;
    }
  }

  /**
   * Calculate checksum
   */
  calculateChecksum(data) {
    try {
      const str = JSON.stringify(data);
      let hash = 0;
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return hash.toString(16);
      
    } catch (error) {
      console.error('Error calculating checksum:', error);
      return '0';
    }
  }

  /**
   * Calculate data size
   */
  calculateDataSize(data) {
    try {
      return JSON.stringify(data).length;
    } catch (error) {
      console.error('Error calculating data size:', error);
      return 0;
    }
  }

  /**
   * Compress data
   */
  async compressData(data) {
    try {
      // Simple compression simulation
      // In production, use actual compression algorithm
      return data;
    } catch (error) {
      console.error('Error compressing data:', error);
      return data;
    }
  }

  /**
   * Decompress data
   */
  async decompressData(data) {
    try {
      // Simple decompression simulation
      // In production, use actual decompression algorithm
      return data;
    } catch (error) {
      console.error('Error decompressing data:', error);
      return data;
    }
  }

  /**
   * Get backup statistics
   */
  getBackupStats() {
    return {
      ...this.backupMetrics,
      totalBackups: this.backups.size,
      isActive: this.isBackupActive,
      currentSession: this.currentSession?.id || null,
      recoveryMode: this.recoveryMode,
      backupInterval: this.backupInterval,
      queueLength: this.backupQueue.length
    };
  }

  /**
   * Get version history for session
   */
  getVersionHistory(sessionId) {
    return this.versionHistory.get(sessionId) || [];
  }

  /**
   * Get all backups
   */
  getAllBackups() {
    return Array.from(this.backups.values());
  }

  /**
   * Get backups for session
   */
  getSessionBackups(sessionId) {
    return Array.from(this.backups.values())
      .filter(backup => backup.sessionId === sessionId);
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
          console.error('Error in backup callback:', error);
        }
      });
    }
  }

  /**
   * Force backup now
   */
  async forceBackup() {
    if (!this.currentSession) {
      throw new Error('No active session to backup');
    }
    
    await this.performBackup();
  }

  /**
   * Clear all backups
   */
  clearAllBackups() {
    try {
      // Clear from memory
      this.backups.clear();
      this.versionHistory.clear();
      
      // Clear from local storage
      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter(key => key.startsWith('transcription_backup_'));
      
      for (const key of backupKeys) {
        localStorage.removeItem(key);
      }
      
      console.log('All backups cleared');
      
    } catch (error) {
      console.error('Error clearing backups:', error);
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    try {
      // Stop backup
      this.stopBackup();
      
      // Clear callbacks
      this.callbacks.clear();
      
      // Clear memory
      this.backups.clear();
      this.versionHistory.clear();
      this.backupQueue = [];
      
      console.log('TranscriptionBackupStrategy destroyed');
      
    } catch (error) {
      console.error('Error destroying backup strategy:', error);
    }
  }
}

// Export singleton instance
export const transcriptionBackupStrategy = new TranscriptionBackupStrategy();