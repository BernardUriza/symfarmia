/**
 * MicrophonePermissionManager
 * 
 * Manages microphone permissions and handles permission requests
 * before initializing any transcription engine
 */

export class MicrophonePermissionManager {
  constructor() {
    this.permissionState = 'prompt'; // 'prompt', 'granted', 'denied'
    this.audioStream = null;
    this.permissionChecked = false;
    this.listeners = new Map();
    this.constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000
      }
    };
  }

  /**
   * Check current permission state
   */
  async checkPermissionState() {
    try {
      // Check if Permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        this.permissionState = permission.state;
        
        // Listen for permission changes
        permission.addEventListener('change', () => {
          this.handlePermissionChange(permission.state);
        });
        
        return permission.state;
      }
      
      // Fallback: try to check if we already have a stream
      if (this.audioStream && this.audioStream.active) {
        this.permissionState = 'granted';
        return 'granted';
      }
      
      return 'prompt';
    } catch (error) {
      console.warn('Failed to check microphone permission:', error);
      return 'prompt';
    }
  }

  /**
   * Request microphone permission
   */
  async requestPermission(constraints = null) {
    try {
      // Check if already granted
      const currentState = await this.checkPermissionState();
      if (currentState === 'granted' && this.audioStream) {
        return {
          granted: true,
          stream: this.audioStream,
          state: 'granted'
        };
      }

      // Request permission
      const audioConstraints = constraints || this.constraints;
      
      console.log('Requesting microphone permission with constraints:', audioConstraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      
      this.audioStream = stream;
      this.permissionState = 'granted';
      this.permissionChecked = true;
      
      this.notifyListeners('granted', { stream });
      
      return {
        granted: true,
        stream: stream,
        state: 'granted'
      };
      
    } catch (error) {
      console.error('Microphone permission denied:', error);
      
      this.permissionState = 'denied';
      this.permissionChecked = true;
      
      const errorInfo = this.classifyPermissionError(error);
      
      this.notifyListeners('denied', { error: errorInfo });
      
      return {
        granted: false,
        stream: null,
        state: 'denied',
        error: errorInfo
      };
    }
  }

  /**
   * Classify permission error
   */
  classifyPermissionError(error) {
    const errorString = error.toString().toLowerCase();
    const errorName = error.name?.toLowerCase() || '';
    
    if (errorName === 'notallowederror' || errorString.includes('permission denied')) {
      return {
        type: 'permission_denied',
        message: 'User denied microphone access',
        recoverable: true,
        userAction: 'Please allow microphone access in your browser settings'
      };
    }
    
    if (errorName === 'notfounderror' || errorString.includes('not found')) {
      return {
        type: 'no_microphone',
        message: 'No microphone found',
        recoverable: false,
        userAction: 'Please connect a microphone to your device'
      };
    }
    
    if (errorName === 'notreadableerror' || errorString.includes('could not start')) {
      return {
        type: 'hardware_error',
        message: 'Microphone is being used by another application',
        recoverable: true,
        userAction: 'Please close other applications using the microphone'
      };
    }
    
    if (errorName === 'overconstrained' || errorString.includes('constraints')) {
      return {
        type: 'constraint_error',
        message: 'Requested audio settings not supported',
        recoverable: true,
        userAction: 'Using default audio settings'
      };
    }
    
    return {
      type: 'unknown',
      message: error.message || 'Unknown error accessing microphone',
      recoverable: false,
      userAction: 'Please check your browser settings and try again'
    };
  }

  /**
   * Handle permission state change
   */
  handlePermissionChange(newState) {
    const oldState = this.permissionState;
    this.permissionState = newState;
    
    console.log(`Microphone permission changed: ${oldState} -> ${newState}`);
    
    if (newState === 'denied' && this.audioStream) {
      this.releaseStream();
    }
    
    this.notifyListeners('stateChange', { 
      oldState, 
      newState,
      stream: this.audioStream 
    });
  }

  /**
   * Get current audio stream
   */
  getAudioStream() {
    return this.audioStream;
  }

  /**
   * Check if permission is granted
   */
  isGranted() {
    return this.permissionState === 'granted' && this.audioStream && this.audioStream.active;
  }

  /**
   * Release audio stream
   */
  releaseStream() {
    if (this.audioStream) {
      console.log('Releasing microphone stream');
      
      // Stop all tracks
      this.audioStream.getTracks().forEach(track => {
        track.stop();
      });
      
      this.audioStream = null;
      this.notifyListeners('streamReleased', {});
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return remove function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Notify listeners
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in permission listener:', error);
        }
      });
    }
  }

  /**
   * Check browser compatibility
   */
  checkBrowserCompatibility() {
    const compatibility = {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      permissions: 'permissions' in navigator,
      audioContext: !!(window.AudioContext || window.webkitAudioContext)
    };
    
    compatibility.isCompatible = compatibility.getUserMedia && compatibility.audioContext;
    
    return compatibility;
  }

  /**
   * Get permission instructions for user
   */
  getPermissionInstructions() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') || userAgent.includes('chromium')) {
      return {
        browser: 'Chrome',
        steps: [
          'Click the lock icon in the address bar',
          'Find "Microphone" and change to "Allow"',
          'Reload the page'
        ]
      };
    }
    
    if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Click the microphone icon in the address bar',
          'Select "Allow" for microphone access',
          'The permission will be remembered'
        ]
      };
    }
    
    if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Go to Safari > Preferences > Websites',
          'Select "Microphone" from the left sidebar',
          'Find this website and change to "Allow"'
        ]
      };
    }
    
    if (userAgent.includes('edge')) {
      return {
        browser: 'Edge',
        steps: [
          'Click the lock icon in the address bar',
          'Click "Permissions for this site"',
          'Find "Microphone" and change to "Allow"'
        ]
      };
    }
    
    return {
      browser: 'Your browser',
      steps: [
        'Check your browser settings',
        'Find microphone permissions',
        'Allow access for this website'
      ]
    };
  }

  /**
   * Test microphone with audio level detection
   */
  async testMicrophone() {
    try {
      if (!this.audioStream) {
        const result = await this.requestPermission();
        if (!result.granted) {
          return { success: false, error: result.error };
        }
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(this.audioStream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      
      // Test for 2 seconds
      const testDuration = 2000;
      const startTime = Date.now();
      let maxLevel = 0;
      let avgLevel = 0;
      let samples = 0;
      
      return new Promise((resolve) => {
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const level = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          maxLevel = Math.max(maxLevel, level);
          avgLevel += level;
          samples++;
          
          if (Date.now() - startTime < testDuration) {
            requestAnimationFrame(checkLevel);
          } else {
            microphone.disconnect();
            audioContext.close();
            
            resolve({
              success: true,
              maxLevel,
              avgLevel: avgLevel / samples,
              working: maxLevel > 10 // Threshold for detecting audio
            });
          }
        };
        
        checkLevel();
      });
      
    } catch (error) {
      console.error('Microphone test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reset permission manager
   */
  reset() {
    this.releaseStream();
    this.permissionState = 'prompt';
    this.permissionChecked = false;
    this.listeners.clear();
  }
}

// Export singleton instance
export const microphonePermissionManager = new MicrophonePermissionManager();