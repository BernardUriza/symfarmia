/**
 * Medical Transcription Resilience
 * 
 * Main orchestrator for seamless transcription continuity during network interruptions
 */

import { networkStatusDetector } from './NetworkStatusDetector.js';
import { transcriptionQualityMonitor } from './TranscriptionQualityMonitor.js';
import { connectionRecoveryService } from './ConnectionRecoveryService.js';
import { offlineTranscriptionBuffer } from './OfflineTranscriptionBuffer.js';
import { audioChunkManager } from './AudioChunkManager.js';
import { medicalAudioPersistence } from './MedicalAudioPersistence.js';
import { transcriptionBackupStrategy } from './TranscriptionBackupStrategy.js';
import { medicalGradeErrorHandler } from './MedicalGradeErrorHandling.js';

export class MedicalTranscriptionResilience {
  constructor() {
    this.currentMode = 'online'; // online, offline, hybrid, emergency
    this.isActive = false;
    this.sessionId = null;
    this.transcriptionState = {
      continuity: 'maintained',
      lastTranscriptionTime: null,
      activeSegments: new Map(),
      pendingSegments: new Map(),
      completedSegments: new Map(),
      totalSegments: 0,
      processedSegments: 0,
      errorSegments: 0
    };
    
    this.resilienceConfiguration = {
      autoModeSwitch: true,
      seamlessTransitions: true,
      medicalGradeReliability: true,
      emergencyModeEnabled: true,
      maxDataLossToleranceSec: 2,
      qualityThreshold: 0.7,
      networkQualityThreshold: 0.5,
      backupFrequency: 5000,
      bufferSize: 50
    };
    
    this.callbacks = new Map();
    this.metrics = {
      totalSessions: 0,
      successfulSessions: 0,
      interruptedSessions: 0,
      dataLossIncidents: 0,
      modeTransitions: 0,
      averageRecoveryTime: 0,
      uptime: 0,
      lastIncident: null
    };
    
    this.transitionHistory = [];
    this.maxTransitionHistory = 100;
    this.coordinationState = 'idle';
    this.emergencyProtocols = {
      enabled: false,
      triggeredAt: null,
      reason: null,
      escalationLevel: 'none'
    };
    
    this.serviceHealth = {
      networkDetector: 'healthy',
      qualityMonitor: 'healthy',
      recoveryService: 'healthy',
      offlineBuffer: 'healthy',
      chunkManager: 'healthy',
      persistence: 'healthy',
      backupStrategy: 'healthy'
    };
    
    this.initialize();
  }

  /**
   * Initialize resilience system
   */
  async initialize() {
    try {
      // Initialize all components
      await this.initializeComponents();
      
      // Setup coordination
      this.setupCoordination();
      
      // Setup monitoring
      this.setupMonitoring();
      
      // Setup emergency protocols
      this.setupEmergencyProtocols();
      
      console.log('MedicalTranscriptionResilience initialized');
      
    } catch (error) {
      console.error('Failed to initialize MedicalTranscriptionResilience:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'initialize'
      });
    }
  }

  /**
   * Initialize all resilience components
   */
  async initializeComponents() {
    try {
      // Check component health
      const healthChecks = await Promise.allSettled([
        this.checkComponentHealth('networkDetector'),
        this.checkComponentHealth('qualityMonitor'),
        this.checkComponentHealth('recoveryService'),
        this.checkComponentHealth('offlineBuffer'),
        this.checkComponentHealth('chunkManager'),
        this.checkComponentHealth('persistence'),
        this.checkComponentHealth('backupStrategy')
      ]);
      
      // Update service health
      healthChecks.forEach((check, index) => {
        const componentNames = ['networkDetector', 'qualityMonitor', 'recoveryService', 
                              'offlineBuffer', 'chunkManager', 'persistence', 'backupStrategy'];
        const componentName = componentNames[index];
        
        this.serviceHealth[componentName] = check.status === 'fulfilled' ? 'healthy' : 'unhealthy';
      });
      
      console.log('Component health check completed:', this.serviceHealth);
      
    } catch (error) {
      console.error('Error initializing components:', error);
      throw error;
    }
  }

  /**
   * Check component health
   */
  async checkComponentHealth(componentName) {
    try {
      switch (componentName) {
        case 'networkDetector':
          return networkStatusDetector.getCurrentStatus();
        case 'qualityMonitor':
          return transcriptionQualityMonitor.getCurrentMetrics();
        case 'recoveryService':
          return connectionRecoveryService.getRecoveryStatus();
        case 'offlineBuffer':
          return offlineTranscriptionBuffer.getQueueStats();
        case 'chunkManager':
          return audioChunkManager.getChunkStats();
        case 'persistence':
          return medicalAudioPersistence.getStorageStats();
        case 'backupStrategy':
          return transcriptionBackupStrategy.getBackupStats();
        default:
          throw new Error(`Unknown component: ${componentName}`);
      }
    } catch (error) {
      console.error(`Health check failed for ${componentName}:`, error);
      throw error;
    }
  }

  /**
   * Setup coordination between services
   */
  setupCoordination() {
    try {
      // Network status coordination
      networkStatusDetector.onStatusChange((status) => {
        this.handleNetworkStatusChange(status);
      });
      
      // Quality monitoring coordination
      transcriptionQualityMonitor.onEvent('qualityDegraded', (data) => {
        this.handleQualityDegradation(data);
      });
      
      transcriptionQualityMonitor.onEvent('modeSwitchRecommended', (data) => {
        this.handleModeSwitchRecommendation(data);
      });
      
      // Recovery service coordination
      connectionRecoveryService.onEvent('recoveryStarted', (data) => {
        this.handleRecoveryStarted(data);
      });
      
      connectionRecoveryService.onEvent('recoverySuccessful', (data) => {
        this.handleRecoverySuccessful(data);
      });
      
      connectionRecoveryService.onEvent('recoveryFailed', (data) => {
        this.handleRecoveryFailed(data);
      });
      
      // Offline buffer coordination
      offlineTranscriptionBuffer.onEvent('itemProcessed', (data) => {
        this.handleOfflineItemProcessed(data);
      });
      
      // Chunk manager coordination
      audioChunkManager.onEvent('chunkReady', (data) => {
        this.handleChunkReady(data);
      });
      
      audioChunkManager.onEvent('chunkProcessed', (data) => {
        this.handleChunkProcessed(data);
      });
      
      // Backup strategy coordination
      transcriptionBackupStrategy.onEvent('backupCompleted', (data) => {
        this.handleBackupCompleted(data);
      });
      
      transcriptionBackupStrategy.onEvent('recoveryAvailable', (data) => {
        this.handleRecoveryAvailable(data);
      });
      
      console.log('Component coordination setup completed');
      
    } catch (error) {
      console.error('Error setting up coordination:', error);
    }
  }

  /**
   * Setup monitoring and health checks
   */
  setupMonitoring() {
    try {
      // Periodic health monitoring
      setInterval(() => {
        this.performHealthCheck();
      }, 30000); // Every 30 seconds
      
      // Continuity monitoring
      setInterval(() => {
        this.monitorTranscriptionContinuity();
      }, 5000); // Every 5 seconds
      
      console.log('Monitoring setup completed');
      
    } catch (error) {
      console.error('Error setting up monitoring:', error);
    }
  }

  /**
   * Setup emergency protocols
   */
  setupEmergencyProtocols() {
    try {
      // Emergency mode triggers
      this.emergencyTriggers = {
        criticalDataLoss: (lossAmount) => lossAmount > this.resilienceConfiguration.maxDataLossToleranceSec * 1000,
        prolongedOutage: (outageTime) => outageTime > 60000, // 1 minute
        systemFailure: (failureCount) => failureCount > 3,
        medicalEmergency: (urgencyLevel) => urgencyLevel === 'emergency' || urgencyLevel === 'critical'
      };
      
      console.log('Emergency protocols setup completed');
      
    } catch (error) {
      console.error('Error setting up emergency protocols:', error);
    }
  }

  /**
   * Start resilience session
   */
  async startSession(sessionConfig = {}) {
    try {
      this.sessionId = sessionConfig.sessionId || `session_${Date.now()}`;
      this.isActive = true;
      this.coordinationState = 'active';
      
      // Initialize session state
      this.transcriptionState = {
        continuity: 'maintained',
        lastTranscriptionTime: Date.now(),
        activeSegments: new Map(),
        pendingSegments: new Map(),
        completedSegments: new Map(),
        totalSegments: 0,
        processedSegments: 0,
        errorSegments: 0
      };
      
      // Configure medical context
      const medicalContext = {
        patientId: sessionConfig.patientId || 'unknown',
        consultationId: sessionConfig.consultationId || 'unknown',
        urgencyLevel: sessionConfig.urgencyLevel || 'routine',
        specialty: sessionConfig.specialty || 'general'
      };
      
      // Set medical context for error handling
      medicalGradeErrorHandler.setMedicalContext(medicalContext);
      
      // Start backup strategy
      transcriptionBackupStrategy.startBackup(this.sessionId, {
        ...medicalContext,
        resilienceConfig: this.resilienceConfiguration
      });
      
      // Initialize current mode based on network status
      const networkStatus = networkStatusDetector.getCurrentStatus();
      await this.determineOptimalMode(networkStatus);
      
      // Update metrics
      this.metrics.totalSessions++;
      
      console.log(`Resilience session started: ${this.sessionId}`);
      
      // Trigger callback
      this.triggerCallback('sessionStarted', {
        sessionId: this.sessionId,
        mode: this.currentMode,
        medicalContext: medicalContext
      });
      
      return {
        success: true,
        sessionId: this.sessionId,
        mode: this.currentMode,
        resilienceLevel: 'medical-grade'
      };
      
    } catch (error) {
      console.error('Error starting resilience session:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'startSession',
        sessionId: this.sessionId
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Stop resilience session
   */
  async stopSession() {
    try {
      if (!this.isActive) return;
      
      console.log(`Stopping resilience session: ${this.sessionId}`);
      
      // Stop backup strategy
      transcriptionBackupStrategy.stopBackup();
      
      // Process any remaining segments
      await this.processRemainingSegments();
      
      // Update session state
      this.isActive = false;
      this.coordinationState = 'idle';
      
      // Calculate session metrics
      const sessionSuccess = this.transcriptionState.errorSegments === 0;
      if (sessionSuccess) {
        this.metrics.successfulSessions++;
      } else {
        this.metrics.interruptedSessions++;
      }
      
      // Trigger callback
      this.triggerCallback('sessionStopped', {
        sessionId: this.sessionId,
        success: sessionSuccess,
        stats: this.getSessionStats()
      });
      
      console.log(`Resilience session stopped: ${this.sessionId}`);
      
      return {
        success: true,
        sessionStats: this.getSessionStats()
      };
      
    } catch (error) {
      console.error('Error stopping resilience session:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'stopSession',
        sessionId: this.sessionId
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle network status changes
   */
  async handleNetworkStatusChange(networkStatus) {
    try {
      console.log('Network status changed:', networkStatus);
      
      // Determine if mode change is needed
      const optimalMode = await this.determineOptimalMode(networkStatus);
      
      if (optimalMode !== this.currentMode) {
        await this.performModeTransition(optimalMode, {
          reason: 'network_change',
          networkStatus: networkStatus
        });
      }
      
      // Update quality monitor
      transcriptionQualityMonitor.setCurrentMode(this.currentMode);
      
    } catch (error) {
      console.error('Error handling network status change:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'handleNetworkStatusChange'
      });
    }
  }

  /**
   * Handle transcription engine switch
   */
  async handleEngineSwitch(engineSwitchData) {
    try {
      console.log('Transcription engine switch detected:', engineSwitchData);
      
      // Preserve current transcription state
      const preservedState = {
        activeSegments: new Map(this.transcriptionState.activeSegments),
        pendingSegments: new Map(this.transcriptionState.pendingSegments),
        lastTranscriptionTime: this.transcriptionState.lastTranscriptionTime
      };
      
      // Notify about engine switch
      this.triggerCallback('engineSwitched', {
        fromEngine: engineSwitchData.fromEngine,
        toEngine: engineSwitchData.toEngine,
        reason: engineSwitchData.reason,
        preservedSegments: preservedState.activeSegments.size + preservedState.pendingSegments.size
      });
      
      // Ensure continuity by reprocessing pending segments
      if (preservedState.pendingSegments.size > 0) {
        console.log(`Reprocessing ${preservedState.pendingSegments.size} pending segments after engine switch`);
        
        for (const [, segment] of preservedState.pendingSegments) {
          await this.reprocessSegment(segment, engineSwitchData.toEngine);
        }
      }
      
      // Update metrics
      this.metrics.engineSwitches = (this.metrics.engineSwitches || 0) + 1;
      
      // Check if emergency mode needed
      if (engineSwitchData.reason === 'critical_failure' || 
          engineSwitchData.toEngine === 'mock-fallback') {
        await this.triggerEmergencyMode('engine_failure', engineSwitchData);
      }
      
    } catch (error) {
      console.error('Error handling engine switch:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'handleEngineSwitch',
        engineData: engineSwitchData
      });
    }
  }

  /**
   * Reprocess segment with new engine
   */
  async reprocessSegment(segment, newEngine) {
    try {
      // Mark segment for reprocessing
      segment.reprocessing = true;
      segment.reprocessEngine = newEngine;
      
      // Move to active segments
      this.transcriptionState.activeSegments.set(segment.id, segment);
      
      // Trigger reprocessing through audio chunk manager
      if (segment.audioData) {
        await audioChunkManager.reprocessChunk(segment.audioData, {
          segmentId: segment.id,
          priority: 'high',
          engine: newEngine
        });
      }
      
    } catch (error) {
      console.error('Error reprocessing segment:', error);
      segment.reprocessing = false;
      segment.error = error.message;
      this.transcriptionState.errorSegments++;
    }
  }

  /**
   * Handle quality degradation
   */
  async handleQualityDegradation(qualityData) {
    try {
      console.log('Quality degradation detected:', qualityData);
      
      // Check if emergency mode should be triggered
      if (qualityData.score < 0.3) {
        await this.triggerEmergencyMode('quality_degradation', qualityData);
      }
      
      // Consider mode switch to more reliable option
      if (qualityData.score < this.resilienceConfiguration.qualityThreshold) {
        const fallbackMode = this.getFallbackMode(this.currentMode);
        if (fallbackMode) {
          await this.performModeTransition(fallbackMode, {
            reason: 'quality_degradation',
            qualityData: qualityData
          });
        }
      }
      
    } catch (error) {
      console.error('Error handling quality degradation:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'handleQualityDegradation'
      });
    }
  }

  /**
   * Handle mode switch recommendations
   */
  async handleModeSwitchRecommendation(recommendation) {
    try {
      console.log('Mode switch recommended:', recommendation);
      
      if (this.resilienceConfiguration.autoModeSwitch) {
        await this.performModeTransition(recommendation.recommendedMode, {
          reason: 'quality_recommendation',
          recommendation: recommendation
        });
      } else {
        // Trigger callback for manual decision
        this.triggerCallback('modeSwitchRecommended', recommendation);
      }
      
    } catch (error) {
      console.error('Error handling mode switch recommendation:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'handleModeSwitchRecommendation'
      });
    }
  }

  /**
   * Determine optimal mode based on current conditions
   */
  async determineOptimalMode(networkStatus) {
    try {
      const qualityMetrics = transcriptionQualityMonitor.getCurrentMetrics();
      
      // Emergency mode takes precedence
      if (this.emergencyProtocols.enabled) {
        return 'emergency';
      }
      
      // Offline mode if no network
      if (!networkStatus.isOnline) {
        return 'offline';
      }
      
      // Online mode if excellent quality
      if (networkStatus.quality === 'excellent' && qualityMetrics.overallQuality > 0.9) {
        return 'online';
      }
      
      // Hybrid mode for moderate quality
      if (networkStatus.quality === 'good' || networkStatus.quality === 'fair') {
        return 'hybrid';
      }
      
      // Offline mode for poor quality
      if (networkStatus.quality === 'poor') {
        return 'offline';
      }
      
      // Default to current mode
      return this.currentMode;
      
    } catch (error) {
      console.error('Error determining optimal mode:', error);
      return this.currentMode;
    }
  }

  /**
   * Perform mode transition
   */
  async performModeTransition(newMode, context) {
    try {
      if (newMode === this.currentMode) return;
      
      console.log(`Transitioning from ${this.currentMode} to ${newMode}:`, context);
      
      const transition = {
        from: this.currentMode,
        to: newMode,
        timestamp: new Date(),
        context: context,
        duration: 0,
        success: false
      };
      
      const startTime = Date.now();
      
      // Pre-transition preparations
      await this.prepareTransition(newMode, context);
      
      // Execute transition
      await this.executeTransition(newMode, context);
      
      // Post-transition validation
      await this.validateTransition(newMode, context);
      
      // Update state
      this.currentMode = newMode;
      transition.duration = Date.now() - startTime;
      transition.success = true;
      
      // Record transition
      this.recordTransition(transition);
      
      // Update metrics
      this.metrics.modeTransitions++;
      
      console.log(`Mode transition completed successfully: ${this.currentMode}`);
      
      // Trigger callback
      this.triggerCallback('modeTransitionCompleted', {
        mode: this.currentMode,
        transition: transition
      });
      
    } catch (error) {
      console.error('Error performing mode transition:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'performModeTransition',
        targetMode: newMode
      });
      
      // Trigger callback
      this.triggerCallback('modeTransitionFailed', {
        targetMode: newMode,
        currentMode: this.currentMode,
        error: error.message
      });
    }
  }

  /**
   * Prepare for mode transition
   */
  async prepareTransition(newMode, _context) {
    try {
      console.log(`Preparing transition to ${newMode}`);
      
      // Ensure all current segments are processed or buffered
      await this.ensureSegmentContinuity();
      
      // Prepare components for new mode
      switch (newMode) {
        case 'offline':
          await this.prepareOfflineMode();
          break;
        case 'online':
          await this.prepareOnlineMode();
          break;
        case 'hybrid':
          await this.prepareHybridMode();
          break;
        case 'emergency':
          await this.prepareEmergencyMode();
          break;
      }
      
    } catch (error) {
      console.error('Error preparing transition:', error);
      throw error;
    }
  }

  /**
   * Execute mode transition
   */
  async executeTransition(newMode, _context) {
    try {
      console.log(`Executing transition to ${newMode}`);
      
      // Configure components for new mode
      switch (newMode) {
        case 'offline':
          await this.configureOfflineMode();
          break;
        case 'online':
          await this.configureOnlineMode();
          break;
        case 'hybrid':
          await this.configureHybridMode();
          break;
        case 'emergency':
          await this.configureEmergencyMode();
          break;
      }
      
      // Update quality monitor
      transcriptionQualityMonitor.setCurrentMode(newMode);
      
    } catch (error) {
      console.error('Error executing transition:', error);
      throw error;
    }
  }

  /**
   * Validate transition
   */
  async validateTransition(newMode, _context) {
    try {
      console.log(`Validating transition to ${newMode}`);
      
      // Check component health
      const healthCheck = await this.performHealthCheck();
      
      if (!healthCheck.allHealthy) {
        throw new Error('Health check failed after transition');
      }
      
      // Validate mode-specific requirements
      switch (newMode) {
        case 'offline':
          await this.validateOfflineMode();
          break;
        case 'online':
          await this.validateOnlineMode();
          break;
        case 'hybrid':
          await this.validateHybridMode();
          break;
        case 'emergency':
          await this.validateEmergencyMode();
          break;
      }
      
    } catch (error) {
      console.error('Error validating transition:', error);
      throw error;
    }
  }

  /**
   * Prepare offline mode
   */
  async prepareOfflineMode() {
    try {
      // Ensure offline buffer is ready
      if (!offlineTranscriptionBuffer.isInitialized) {
        await offlineTranscriptionBuffer.initialize();
      }
      
      // Prepare local persistence
      if (!medicalAudioPersistence.isInitialized) {
        await medicalAudioPersistence.initialize();
      }
      
      console.log('Offline mode preparation completed');
      
    } catch (error) {
      console.error('Error preparing offline mode:', error);
      throw error;
    }
  }

  /**
   * Configure offline mode
   */
  async configureOfflineMode() {
    try {
      // Route audio to offline buffer
      audioChunkManager.onEvent('chunkReady', (chunk) => {
        offlineTranscriptionBuffer.addToQueue(chunk.audioData, {
          sessionId: this.sessionId,
          chunkId: chunk.id,
          timestamp: chunk.timestamp
        });
      });
      
      console.log('Offline mode configured');
      
    } catch (error) {
      console.error('Error configuring offline mode:', error);
      throw error;
    }
  }

  /**
   * Validate offline mode
   */
  async validateOfflineMode() {
    try {
      const bufferStats = offlineTranscriptionBuffer.getQueueStats();
      
      if (bufferStats.totalItems === undefined) {
        throw new Error('Offline buffer not functioning properly');
      }
      
      console.log('Offline mode validation passed');
      
    } catch (error) {
      console.error('Error validating offline mode:', error);
      throw error;
    }
  }

  /**
   * Prepare online mode
   */
  async prepareOnlineMode() {
    try {
      // Ensure network connectivity
      const networkStatus = networkStatusDetector.getCurrentStatus();
      
      if (!networkStatus.isOnline) {
        throw new Error('Cannot prepare online mode: network unavailable');
      }
      
      console.log('Online mode preparation completed');
      
    } catch (error) {
      console.error('Error preparing online mode:', error);
      throw error;
    }
  }

  /**
   * Configure online mode
   */
  async configureOnlineMode() {
    try {
      // Route audio directly to transcription service
      audioChunkManager.onEvent('chunkReady', (chunk) => {
        this.processChunkOnline(chunk);
      });
      
      console.log('Online mode configured');
      
    } catch (error) {
      console.error('Error configuring online mode:', error);
      throw error;
    }
  }

  /**
   * Validate online mode
   */
  async validateOnlineMode() {
    try {
      const networkStatus = networkStatusDetector.getCurrentStatus();
      
      if (!networkStatus.isOnline) {
        throw new Error('Online mode validation failed: network unavailable');
      }
      
      console.log('Online mode validation passed');
      
    } catch (error) {
      console.error('Error validating online mode:', error);
      throw error;
    }
  }

  /**
   * Prepare hybrid mode
   */
  async prepareHybridMode() {
    try {
      // Prepare both online and offline capabilities
      await this.prepareOnlineMode();
      await this.prepareOfflineMode();
      
      console.log('Hybrid mode preparation completed');
      
    } catch (error) {
      console.error('Error preparing hybrid mode:', error);
      throw error;
    }
  }

  /**
   * Configure hybrid mode
   */
  async configureHybridMode() {
    try {
      // Route audio to both online and offline processing
      audioChunkManager.onEvent('chunkReady', (chunk) => {
        this.processChunkHybrid(chunk);
      });
      
      console.log('Hybrid mode configured');
      
    } catch (error) {
      console.error('Error configuring hybrid mode:', error);
      throw error;
    }
  }

  /**
   * Validate hybrid mode
   */
  async validateHybridMode() {
    try {
      await this.validateOnlineMode();
      await this.validateOfflineMode();
      
      console.log('Hybrid mode validation passed');
      
    } catch (error) {
      console.error('Error validating hybrid mode:', error);
      throw error;
    }
  }

  /**
   * Prepare emergency mode
   */
  async prepareEmergencyMode() {
    try {
      // Prepare all capabilities for maximum resilience
      await this.prepareHybridMode();
      
      // Set emergency configurations
      connectionRecoveryService.setEmergencyMode(true);
      
      console.log('Emergency mode preparation completed');
      
    } catch (error) {
      console.error('Error preparing emergency mode:', error);
      throw error;
    }
  }

  /**
   * Configure emergency mode
   */
  async configureEmergencyMode() {
    try {
      // Maximum resilience configuration
      await this.configureHybridMode();
      
      // Additional emergency protocols
      this.resilienceConfiguration.backupFrequency = 2000; // More frequent backups
      this.resilienceConfiguration.maxDataLossToleranceSec = 0.5; // Lower tolerance
      
      console.log('Emergency mode configured');
      
    } catch (error) {
      console.error('Error configuring emergency mode:', error);
      throw error;
    }
  }

  /**
   * Validate emergency mode
   */
  async validateEmergencyMode() {
    try {
      await this.validateHybridMode();
      
      // Additional emergency validations
      if (!this.emergencyProtocols.enabled) {
        throw new Error('Emergency protocols not enabled');
      }
      
      console.log('Emergency mode validation passed');
      
    } catch (error) {
      console.error('Error validating emergency mode:', error);
      throw error;
    }
  }

  /**
   * Trigger emergency mode
   */
  async triggerEmergencyMode(reason, context) {
    try {
      console.log(`Emergency mode triggered: ${reason}`, context);
      
      this.emergencyProtocols.enabled = true;
      this.emergencyProtocols.triggeredAt = new Date();
      this.emergencyProtocols.reason = reason;
      this.emergencyProtocols.escalationLevel = 'high';
      
      // Perform emergency transition
      await this.performModeTransition('emergency', {
        reason: 'emergency_triggered',
        emergencyReason: reason,
        context: context
      });
      
      // Trigger callback
      this.triggerCallback('emergencyModeTriggered', {
        reason: reason,
        context: context,
        protocols: this.emergencyProtocols
      });
      
    } catch (error) {
      console.error('Error triggering emergency mode:', error);
      await medicalGradeErrorHandler.handleError(error, {
        component: 'MedicalTranscriptionResilience',
        operation: 'triggerEmergencyMode',
        reason: reason
      });
    }
  }

  /**
   * Get fallback mode
   */
  getFallbackMode(currentMode) {
    const fallbackMap = {
      'online': 'hybrid',
      'hybrid': 'offline',
      'offline': null,
      'emergency': null
    };
    
    return fallbackMap[currentMode];
  }

  /**
   * Ensure segment continuity
   */
  async ensureSegmentContinuity() {
    try {
      // Process any pending segments
      const pendingSegments = Array.from(this.transcriptionState.pendingSegments.values());
      
      for (const segment of pendingSegments) {
        try {
          await this.processSegment(segment);
        } catch (error) {
          console.error('Error processing pending segment:', error);
          // Move to error state but don't throw
          this.transcriptionState.errorSegments++;
          this.transcriptionState.pendingSegments.delete(segment.id);
        }
      }
      
    } catch (error) {
      console.error('Error ensuring segment continuity:', error);
    }
  }

  /**
   * Process remaining segments
   */
  async processRemainingSegments() {
    try {
      // Process any active segments
      const activeSegments = Array.from(this.transcriptionState.activeSegments.values());
      
      for (const segment of activeSegments) {
        try {
          await this.processSegment(segment);
        } catch (error) {
          console.error('Error processing active segment:', error);
          this.transcriptionState.errorSegments++;
        }
      }
      
      // Clear active segments
      this.transcriptionState.activeSegments.clear();
      
    } catch (error) {
      console.error('Error processing remaining segments:', error);
    }
  }

  /**
   * Process segment
   */
  async processSegment(segment) {
    try {
      // Implementation depends on current mode
      switch (this.currentMode) {
        case 'online':
          return await this.processChunkOnline(segment);
        case 'offline':
          return await this.processChunkOffline(segment);
        case 'hybrid':
        case 'emergency':
          return await this.processChunkHybrid(segment);
      }
      
    } catch (error) {
      console.error('Error processing segment:', error);
      throw error;
    }
  }

  /**
   * Process chunk online
   */
  async processChunkOnline(chunk) {
    try {
      // Send directly to transcription service
      // Implementation would depend on the actual service
      console.log('Processing chunk online:', chunk.id);
      
      // Update state
      this.transcriptionState.activeSegments.set(chunk.id, chunk);
      
    } catch (error) {
      console.error('Error processing chunk online:', error);
      throw error;
    }
  }

  /**
   * Process chunk offline
   */
  async processChunkOffline(chunk) {
    try {
      // Add to offline buffer
      await offlineTranscriptionBuffer.addToQueue(chunk.audioData, {
        sessionId: this.sessionId,
        chunkId: chunk.id,
        timestamp: chunk.timestamp
      });
      
      console.log('Processing chunk offline:', chunk.id);
      
    } catch (error) {
      console.error('Error processing chunk offline:', error);
      throw error;
    }
  }

  /**
   * Process chunk hybrid
   */
  async processChunkHybrid(chunk) {
    try {
      // Try online first, fallback to offline
      try {
        await this.processChunkOnline(chunk);
      } catch (error) {
        console.log('Online processing failed, falling back to offline');
        await this.processChunkOffline(chunk);
      }
      
    } catch (error) {
      console.error('Error processing chunk hybrid:', error);
      throw error;
    }
  }

  /**
   * Handle chunk ready
   */
  async handleChunkReady(chunk) {
    try {
      this.transcriptionState.totalSegments++;
      this.transcriptionState.lastTranscriptionTime = Date.now();
      
      // Process based on current mode
      await this.processSegment(chunk);
      
    } catch (error) {
      console.error('Error handling chunk ready:', error);
      this.transcriptionState.errorSegments++;
    }
  }

  /**
   * Handle chunk processed
   */
  async handleChunkProcessed(chunk) {
    try {
      this.transcriptionState.processedSegments++;
      this.transcriptionState.activeSegments.delete(chunk.id);
      this.transcriptionState.completedSegments.set(chunk.id, chunk);
      
      // Update backup with processed chunk
      transcriptionBackupStrategy.updateTranscriptionData({
        processedSegments: this.transcriptionState.processedSegments,
        totalSegments: this.transcriptionState.totalSegments,
        lastProcessedChunk: chunk
      });
      
    } catch (error) {
      console.error('Error handling chunk processed:', error);
    }
  }

  /**
   * Handle recovery started
   */
  async handleRecoveryStarted(data) {
    try {
      console.log('Recovery started:', data);
      
      // Switch to appropriate mode during recovery
      if (this.currentMode === 'online') {
        await this.performModeTransition('hybrid', {
          reason: 'recovery_started',
          recoveryData: data
        });
      }
      
    } catch (error) {
      console.error('Error handling recovery started:', error);
    }
  }

  /**
   * Handle recovery successful
   */
  async handleRecoverySuccessful(data) {
    try {
      console.log('Recovery successful:', data);
      
      // Switch back to online mode if appropriate
      const networkStatus = networkStatusDetector.getCurrentStatus();
      if (networkStatus.quality === 'excellent' || networkStatus.quality === 'good') {
        await this.performModeTransition('online', {
          reason: 'recovery_successful',
          recoveryData: data
        });
      }
      
    } catch (error) {
      console.error('Error handling recovery successful:', error);
    }
  }

  /**
   * Handle recovery failed
   */
  async handleRecoveryFailed(data) {
    try {
      console.log('Recovery failed:', data);
      
      // Switch to offline mode if not already
      if (this.currentMode !== 'offline') {
        await this.performModeTransition('offline', {
          reason: 'recovery_failed',
          recoveryData: data
        });
      }
      
    } catch (error) {
      console.error('Error handling recovery failed:', error);
    }
  }

  /**
   * Handle offline item processed
   */
  async handleOfflineItemProcessed(item) {
    try {
      console.log('Offline item processed:', item.id);
      
      // Update transcription state
      this.transcriptionState.processedSegments++;
      
    } catch (error) {
      console.error('Error handling offline item processed:', error);
    }
  }

  /**
   * Handle backup completed
   */
  async handleBackupCompleted(backup) {
    try {
      console.log('Backup completed:', backup.id);
      
      // Update backup metrics
      // Implementation depends on requirements
      
    } catch (error) {
      console.error('Error handling backup completed:', error);
    }
  }

  /**
   * Handle recovery available
   */
  async handleRecoveryAvailable(backups) {
    try {
      console.log('Recovery available:', backups.length);
      
      // Trigger callback for user decision
      this.triggerCallback('recoveryAvailable', {
        backups: backups,
        sessionId: this.sessionId
      });
      
    } catch (error) {
      console.error('Error handling recovery available:', error);
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      await this.initializeComponents();
      
      const allHealthy = Object.values(this.serviceHealth).every(status => status === 'healthy');
      
      return {
        allHealthy: allHealthy,
        serviceHealth: this.serviceHealth,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error performing health check:', error);
      return {
        allHealthy: false,
        serviceHealth: this.serviceHealth,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Monitor transcription continuity
   */
  monitorTranscriptionContinuity() {
    try {
      if (!this.isActive) return;
      
      const now = Date.now();
      const timeSinceLastTranscription = now - this.transcriptionState.lastTranscriptionTime;
      
      // Check for continuity break
      if (timeSinceLastTranscription > this.resilienceConfiguration.maxDataLossToleranceSec * 1000) {
        console.warn('Transcription continuity break detected');
        
        this.transcriptionState.continuity = 'interrupted';
        this.metrics.dataLossIncidents++;
        this.metrics.lastIncident = new Date();
        
        // Trigger callback
        this.triggerCallback('continuityBreak', {
          timeSinceLastTranscription: timeSinceLastTranscription,
          maxTolerance: this.resilienceConfiguration.maxDataLossToleranceSec * 1000
        });
        
        // Consider emergency mode
        if (this.emergencyTriggers.criticalDataLoss(timeSinceLastTranscription)) {
          this.triggerEmergencyMode('critical_data_loss', {
            timeSinceLastTranscription: timeSinceLastTranscription
          });
        }
      } else {
        if (this.transcriptionState.continuity === 'interrupted') {
          this.transcriptionState.continuity = 'restored';
          
          // Trigger callback
          this.triggerCallback('continuityRestored', {
            timeSinceLastTranscription: timeSinceLastTranscription
          });
        }
      }
      
    } catch (error) {
      console.error('Error monitoring transcription continuity:', error);
    }
  }

  /**
   * Record transition
   */
  recordTransition(transition) {
    try {
      this.transitionHistory.push(transition);
      
      // Maintain history size
      if (this.transitionHistory.length > this.maxTransitionHistory) {
        this.transitionHistory.shift();
      }
      
    } catch (error) {
      console.error('Error recording transition:', error);
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      mode: this.currentMode,
      transcriptionState: this.transcriptionState,
      continuity: this.transcriptionState.continuity,
      processedSegments: this.transcriptionState.processedSegments,
      totalSegments: this.transcriptionState.totalSegments,
      errorSegments: this.transcriptionState.errorSegments,
      successRate: this.transcriptionState.totalSegments > 0 ? 
        this.transcriptionState.processedSegments / this.transcriptionState.totalSegments : 0,
      emergencyMode: this.emergencyProtocols.enabled
    };
  }

  /**
   * Get resilience metrics
   */
  getResilienceMetrics() {
    return {
      ...this.metrics,
      currentMode: this.currentMode,
      isActive: this.isActive,
      serviceHealth: this.serviceHealth,
      emergencyProtocols: this.emergencyProtocols,
      transitionHistory: this.transitionHistory.slice(-10) // Last 10 transitions
    };
  }

  /**
   * Get current status
   */
  getCurrentStatus() {
    return {
      mode: this.currentMode,
      isActive: this.isActive,
      sessionId: this.sessionId,
      continuity: this.transcriptionState.continuity,
      serviceHealth: this.serviceHealth,
      emergencyMode: this.emergencyProtocols.enabled,
      coordinationState: this.coordinationState
    };
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
          console.error('Error in resilience callback:', error);
        }
      });
    }
  }

  /**
   * Destroy and cleanup
   */
  async destroy() {
    try {
      // Stop active session
      if (this.isActive) {
        await this.stopSession();
      }
      
      // Clear callbacks
      this.callbacks.clear();
      
      // Clear state
      this.transitionHistory = [];
      this.transcriptionState = null;
      
      console.log('MedicalTranscriptionResilience destroyed');
      
    } catch (error) {
      console.error('Error destroying resilience system:', error);
    }
  }
}

// Export singleton instance
export const medicalTranscriptionResilience = new MedicalTranscriptionResilience();