/**
 * Visual Network Indicator
 * 
 * Shows doctors current transcription mode with clear status indicators
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  WifiIcon, 
  CloudIcon, 
  ComputerDesktopIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SignalIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const VisualNetworkIndicator = ({
  networkStatusDetector,
  transcriptionQualityMonitor,
  medicalTranscriptionResilience,
  className = '',
  showDetails = true,
  compact = false
}) => {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    quality: 'unknown',
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    medicalGrade: false
  });

  const [transcriptionMode, setTranscriptionMode] = useState('online');
  const [qualityMetrics, setQualityMetrics] = useState({
    overallQuality: 0,
    networkLatency: 0,
    transcriptionAccuracy: 0,
    audioQuality: 0
  });

  const [resilienceStatus, setResilienceStatus] = useState({
    isActive: false,
    continuity: 'maintained',
    emergencyMode: false,
    mode: 'online'
  });

  const [isRecovering, setIsRecovering] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize and setup listeners
  useEffect(() => {
    if (!networkStatusDetector || !transcriptionQualityMonitor || !medicalTranscriptionResilience) {
      return;
    }

    // Get initial states
    setNetworkStatus(networkStatusDetector.getCurrentStatus());
    setQualityMetrics(transcriptionQualityMonitor.getCurrentMetrics());
    setResilienceStatus(medicalTranscriptionResilience.getCurrentStatus());

    // Setup listeners
    const unsubscribeNetwork = networkStatusDetector.onStatusChange(handleNetworkStatusChange);
    const unsubscribeQuality = transcriptionQualityMonitor.onEvent('qualityUpdated', handleQualityUpdate);
    const unsubscribeMode = medicalTranscriptionResilience.onEvent('modeTransitionCompleted', handleModeTransition);
    const unsubscribeRecovery = medicalTranscriptionResilience.onEvent('recoveryStarted', handleRecoveryStarted);
    const unsubscribeRecoveryComplete = medicalTranscriptionResilience.onEvent('recoveryCompleted', handleRecoveryCompleted);

    return () => {
      unsubscribeNetwork?.();
      unsubscribeQuality?.();
      unsubscribeMode?.();
      unsubscribeRecovery?.();
      unsubscribeRecoveryComplete?.();
    };
  }, [networkStatusDetector, transcriptionQualityMonitor, medicalTranscriptionResilience]);

  const handleNetworkStatusChange = useCallback((status) => {
    setNetworkStatus(status);
    setLastUpdate(new Date());
  }, []);

  const handleQualityUpdate = useCallback((data) => {
    setQualityMetrics(data.metrics);
    setLastUpdate(new Date());
  }, []);

  const handleModeTransition = useCallback((data) => {
    setTranscriptionMode(data.mode);
    setLastUpdate(new Date());
  }, []);

  const handleRecoveryStarted = useCallback(() => {
    setIsRecovering(true);
  }, []);

  const handleRecoveryCompleted = useCallback(() => {
    setIsRecovering(false);
  }, []);

  // Get status color based on network quality
  const getStatusColor = useCallback(() => {
    if (!networkStatus.isOnline) return 'text-red-500';
    if (resilienceStatus.emergencyMode) return 'text-red-600';
    if (isRecovering) return 'text-yellow-500';
    
    switch (networkStatus.quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-orange-500';
      default: return 'text-gray-400';
    }
  }, [networkStatus, resilienceStatus.emergencyMode, isRecovering]);

  // Get mode icon
  const getModeIcon = useCallback(() => {
    if (isRecovering) {
      return <ArrowPathIcon className="h-5 w-5 animate-spin" />;
    }

    switch (transcriptionMode) {
      case 'online':
        return <CloudIcon className="h-5 w-5" />;
      case 'offline':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      case 'hybrid':
        return <div className="relative">
          <CloudIcon className="h-5 w-5" />
          <ComputerDesktopIcon className="h-3 w-3 absolute -bottom-1 -right-1" />
        </div>;
      case 'emergency':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <ComputerDesktopIcon className="h-5 w-5" />;
    }
  }, [transcriptionMode, isRecovering]);

  // Get network quality indicator
  const getNetworkQualityIndicator = useCallback(() => {
    if (!networkStatus.isOnline) {
      return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }

    const qualityIcons = {
      'excellent': <CheckCircleIcon className="h-4 w-4 text-green-500" />,
      'good': <CheckCircleIcon className="h-4 w-4 text-green-400" />,
      'fair': <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />,
      'poor': <XCircleIcon className="h-4 w-4 text-orange-500" />
    };

    return qualityIcons[networkStatus.quality] || <SignalIcon className="h-4 w-4 text-gray-400" />;
  }, [networkStatus]);

  // Get signal strength bars
  const getSignalStrength = useCallback(() => {
    if (!networkStatus.isOnline) return 0;
    
    const qualityValues = {
      'excellent': 5,
      'good': 4,
      'fair': 3,
      'poor': 2,
      'offline': 0
    };

    return qualityValues[networkStatus.quality] || 1;
  }, [networkStatus.quality]);

  // Format latency
  const formatLatency = useCallback((latency) => {
    if (latency === 0 || latency === Infinity) return 'N/A';
    return `${Math.round(latency)}ms`;
  }, []);

  // Format bandwidth
  const formatBandwidth = useCallback((downlink) => {
    if (downlink === 0) return 'N/A';
    if (downlink >= 1) return `${downlink.toFixed(1)} Mbps`;
    return `${(downlink * 1000).toFixed(0)} kbps`;
  }, []);

  // Get mode description
  const getModeDescription = useCallback(() => {
    if (isRecovering) return 'Recovering connection...';
    
    const descriptions = {
      'online': 'Cloud transcription active',
      'offline': 'Local transcription active',
      'hybrid': 'Hybrid mode - cloud with local backup',
      'emergency': 'Emergency mode - maximum resilience'
    };

    return descriptions[transcriptionMode] || 'Transcription mode unknown';
  }, [transcriptionMode, isRecovering]);

  // Get medical grade indicator
  const getMedicalGradeIndicator = useCallback(() => {
    if (networkStatus.medicalGrade || transcriptionMode === 'emergency') {
      return (
        <div className="flex items-center space-x-1">
          <BoltIcon className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-medium text-blue-600">Medical Grade</span>
        </div>
      );
    }
    return null;
  }, [networkStatus.medicalGrade, transcriptionMode]);

  // Compact view
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
          {getModeIcon()}
          <span className="text-sm font-medium">
            {transcriptionMode.charAt(0).toUpperCase() + transcriptionMode.slice(1)}
          </span>
        </div>
        {getNetworkQualityIndicator()}
        {getMedicalGradeIndicator()}
      </div>
    );
  }

  // Full view
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={getStatusColor()}>
            {getModeIcon()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Transcription Status
            </h3>
            <p className="text-xs text-gray-500">
              {getModeDescription()}
            </p>
          </div>
        </div>
        {getMedicalGradeIndicator()}
      </div>

      {/* Network Status */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center space-x-2">
          <WifiIcon className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Network</div>
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {networkStatus.isOnline ? 'Online' : 'Offline'}
              </span>
              {getNetworkQualityIndicator()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SignalIcon className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Quality</div>
            <div className="text-sm font-medium capitalize">
              {networkStatus.quality}
            </div>
          </div>
        </div>
      </div>

      {/* Signal Strength */}
      <div className="mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Signal Strength</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-2 h-4 rounded-sm ${
                  bar <= getSignalStrength()
                    ? getStatusColor().replace('text-', 'bg-')
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-500">Latency</div>
            <div className="text-sm font-medium">
              {formatLatency(networkStatus.rtt || qualityMetrics.networkLatency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Bandwidth</div>
            <div className="text-sm font-medium">
              {formatBandwidth(networkStatus.downlink)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Audio Quality</div>
            <div className="text-sm font-medium">
              {Math.round(qualityMetrics.audioQuality * 100)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Accuracy</div>
            <div className="text-sm font-medium">
              {Math.round(qualityMetrics.transcriptionAccuracy * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Connection Type */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Connection: {networkStatus.connectionType} ({networkStatus.effectiveType})
        </span>
        <span>
          Updated: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      {/* Emergency Mode Banner */}
      {resilienceStatus.emergencyMode && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm font-medium text-red-800">
                Emergency Mode Active
              </div>
              <div className="text-xs text-red-600">
                Maximum resilience protocols engaged
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Status */}
      {isRecovering && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
            <div>
              <div className="text-sm font-medium text-yellow-800">
                Connection Recovery
              </div>
              <div className="text-xs text-yellow-600">
                Attempting to restore optimal connectivity
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continuity Status */}
      {resilienceStatus.continuity !== 'maintained' && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-sm font-medium text-orange-800">
                Continuity {resilienceStatus.continuity}
              </div>
              <div className="text-xs text-orange-600">
                Transcription flow affected
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Prop types for better development experience
VisualNetworkIndicator.propTypes = {
  networkStatusDetector: PropTypes.object,
  transcriptionQualityMonitor: PropTypes.object,
  medicalTranscriptionResilience: PropTypes.object,
  className: PropTypes.string,
  showDetails: PropTypes.bool,
  compact: PropTypes.bool
};

export default VisualNetworkIndicator;