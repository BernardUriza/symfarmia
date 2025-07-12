/**
 * UserInteractionRequired Component
 * 
 * Handles user interaction requirement for AudioContext initialization
 * and microphone permissions in medical transcription systems
 */

import React, { useState, useCallback } from 'react';
import { MicrophoneIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export const UserInteractionRequired = ({ 
  onInteractionComplete, 
  onPermissionDenied,
  requireMicrophone = true,
  className = '',
  children
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('pending'); // pending, requesting, granted, denied
  const [error, setError] = useState(null);
  
  const handleUserInteraction = useCallback(async () => {
    try {
      setStatus('requesting');
      setError(null);
      
      // Create AudioContext on user gesture
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Request microphone permission if required
      if (requireMicrophone) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 16000
            } 
          });
          
          // Resume audio context after permission granted
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          setStatus('granted');
          
          // Call callback with both context and stream
          if (onInteractionComplete) {
            onInteractionComplete({
              audioContext,
              audioStream: stream,
              permissions: { microphone: true }
            });
          }
          
        } catch (permissionError) {
          console.error('Microphone permission denied:', permissionError);
          setStatus('denied');
          setError(t('conversation.permissions.microphone_denied'));
          
          if (onPermissionDenied) {
            onPermissionDenied(permissionError);
          }
        }
      } else {
        // Just create audio context without microphone
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        setStatus('granted');
        
        if (onInteractionComplete) {
          onInteractionComplete({
            audioContext,
            audioStream: null,
            permissions: { microphone: false }
          });
        }
      }
      
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      setStatus('denied');
      setError(t('conversation.permissions.audio_init_failed'));
      
      if (onPermissionDenied) {
        onPermissionDenied(error);
      }
    }
  }, [requireMicrophone, onInteractionComplete, onPermissionDenied, t]);
  
  // If already granted, show children
  if (status === 'granted') {
    return <>{children}</>;
  }
  
  return (
    <div className={`user-interaction-required ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            {status === 'denied' ? (
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
            ) : (
              <MicrophoneIcon className="h-12 w-12 text-blue-500 mx-auto" />
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold mb-2">
            {status === 'denied' 
              ? t('conversation.permissions.access_denied')
              : t('conversation.permissions.access_required')}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-4">
            {status === 'denied' && error
              ? error
              : requireMicrophone
                ? t('conversation.permissions.microphone_description')
                : t('conversation.permissions.audio_description')}
          </p>
          
          {/* Instructions for denied state */}
          {status === 'denied' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-left">
              <p className="font-semibold mb-1">{t('conversation.permissions.fix_instructions')}</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>{t('conversation.permissions.fix_step1')}</li>
                <li>{t('conversation.permissions.fix_step2')}</li>
                <li>{t('conversation.permissions.fix_step3')}</li>
              </ol>
            </div>
          )}
          
          {/* Action button */}
          <button
            onClick={handleUserInteraction}
            disabled={status === 'requesting'}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              status === 'requesting'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : status === 'denied'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {status === 'requesting'
              ? t('conversation.permissions.requesting')
              : status === 'denied'
                ? t('conversation.permissions.try_again')
                : t('conversation.permissions.grant_access')}
          </button>
          
          {/* Privacy notice */}
          <p className="text-xs text-gray-500 mt-4">
            {t('conversation.permissions.privacy_notice')}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for managing user interaction requirements
 */
export const useUserInteraction = () => {
  const [interactionState, setInteractionState] = useState({
    audioContext: null,
    audioStream: null,
    permissions: {},
    isReady: false
  });
  
  const handleInteractionComplete = useCallback((result) => {
    setInteractionState({
      ...result,
      isReady: true
    });
  }, []);
  
  const cleanup = useCallback(() => {
    if (interactionState.audioStream) {
      interactionState.audioStream.getTracks().forEach(track => track.stop());
    }
    if (interactionState.audioContext) {
      interactionState.audioContext.close();
    }
    setInteractionState({
      audioContext: null,
      audioStream: null,
      permissions: {},
      isReady: false
    });
  }, [interactionState]);
  
  return {
    ...interactionState,
    handleInteractionComplete,
    cleanup
  };
};

export default UserInteractionRequired;