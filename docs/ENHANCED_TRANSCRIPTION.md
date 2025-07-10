# Enhanced Transcription System Documentation

## Overview

The Enhanced Transcription System provides a professional, voice-reactive interface for real-time speech-to-text conversion with medical terminology optimization. It features advanced animations, real-time word display, and comprehensive audio visualization.

## Components

### 1. VoiceReactiveMicrophone
Voice-responsive microphone animation component.

```tsx
import { VoiceReactiveMicrophone } from '@/components/ui';

<VoiceReactiveMicrophone 
  audioLevel={85}
  isRecording={true}
  size="lg"
  className="custom-styles"
/>
```

**Props:**
- `audioLevel`: number (0-100) - Real-time audio level
- `isRecording`: boolean - Recording state
- `size`: 'sm' | 'md' | 'lg' - Component size
- `className`: string - Additional CSS classes

**Features:**
- **Voice-reactive rings**: Multiple animated rings that respond to audio level
- **Color changing**: Blue (normal) → Red (loud voice detection)
- **Recording indicator**: Pulsing red dot when active
- **Smooth animations**: Powered by Framer Motion

### 2. AudioSpectrum
Real-time frequency spectrum visualization.

```tsx
import { AudioSpectrum } from '@/components/ui';

<AudioSpectrum 
  audioLevel={60}
  isRecording={true}
  barCount={16}
  height={48}
/>
```

**Props:**
- `audioLevel`: number - Current audio level
- `isRecording`: boolean - Recording state
- `barCount`: number - Number of spectrum bars (default: 12)
- `height`: number - Component height in pixels
- `className`: string - Additional styles

**Features:**
- **Dynamic bars**: Each bar responds differently to audio
- **Gradient colors**: Blue to green gradient
- **Natural variation**: Simulates real frequency spectrum
- **Smooth transitions**: 0.1s animation duration

### 3. LiveTranscriptionDisplay
Real-time transcription display with word-by-word updates.

```tsx
import { LiveTranscriptionDisplay } from '@/components/ui';

<LiveTranscriptionDisplay 
  liveTranscript="Current speaking..."
  finalTranscript="Previous confirmed text."
  isRecording={true}
/>
```

**Props:**
- `liveTranscript`: string - Current live transcription
- `finalTranscript`: string - Finalized transcription text
- `isRecording`: boolean - Recording state
- `className`: string - Additional styles

**Features:**
- **Live typing cursor**: Animated blinking cursor during transcription
- **Word count**: Real-time word statistics
- **Status indicators**: Recording status and live indicators
- **Dual text zones**: Separate areas for final vs live text

### 4. TranscriptionModelInfo
Development overlay showing model information.

```tsx
import { TranscriptionModelInfo } from '@/components/ui';

<TranscriptionModelInfo service="whisper" />
```

**Props:**
- `service`: 'browser' | 'whisper' | 'deepgram' - Transcription service
- `className`: string - Additional styles

**Features:**
- **Development only**: Only shows in development mode
- **Service information**: Model, provider, latency, language
- **Color coding**: Different colors per service
- **Non-intrusive**: Fixed position overlay

### 5. EnhancedTranscriptionPanel
Complete transcription interface integrating all components.

```tsx
import { EnhancedTranscriptionPanel } from '@/components/consultation';

<EnhancedTranscriptionPanel 
  onTranscriptionComplete={(text) => console.log(text)}
  showModelInfo={true}
  showSpectrum={true}
  microphoneSize="lg"
/>
```

**Props:**
- `onTranscriptionComplete`: (text: string) => void - Callback for completed transcription
- `className`: string - Additional styles
- `showModelInfo`: boolean - Show development model info
- `showSpectrum`: boolean - Show audio spectrum
- `microphoneSize`: 'sm' | 'md' | 'lg' - Microphone size

**Features:**
- **Complete interface**: All transcription features in one component
- **Statistics panel**: Words, confidence, medical terms, audio level
- **Control buttons**: Start, stop, reset, copy
- **Medical terms detection**: Automatic medical vocabulary identification
- **Error handling**: User-friendly error display

## Hook: useEnhancedTranscription

Advanced transcription hook with word-by-word processing.

```tsx
import { useEnhancedTranscription } from '@/hooks';

const {
  words,
  currentWord,
  finalTranscript,
  liveTranscript,
  totalWords,
  confidence,
  medicalTerms,
  isRecording,
  status,
  error,
  audioLevel,
  service,
  startTranscription,
  stopTranscription,
  resetTranscription,
  getTranscriptionText
} = useEnhancedTranscription({
  realTimeUpdates: true,
  medicalOptimization: true,
  language: 'es-ES',
  service: 'browser'
});
```

**Configuration Options:**
- `autoStart`: boolean - Auto-start on mount
- `realTimeUpdates`: boolean - Enable live updates
- `medicalOptimization`: boolean - Medical terms detection
- `language`: string - Speech recognition language
- `service`: TranscriptionService - Recognition service

**Returned Data:**
- `words`: Word[] - Array of transcribed words
- `currentWord`: string - Current word being transcribed
- `finalTranscript`: string - Finalized text
- `liveTranscript`: string - Current live text
- `totalWords`: number - Total word count
- `confidence`: number - Recognition confidence (0-1)
- `medicalTerms`: string[] - Detected medical terms
- `isRecording`: boolean - Recording state
- `status`: TranscriptionStatus - Current status
- `error`: string | null - Error message if any
- `audioLevel`: number - Current audio level (0-100)
- `service`: TranscriptionService - Active service

**Actions:**
- `startTranscription()`: Start recording
- `stopTranscription()`: Stop recording
- `resetTranscription()`: Reset all state
- `getTranscriptionText()`: Get current final text

## Medical Terms Detection

The system automatically detects medical terminology in Spanish:

**Detected Terms:**
- dolor, fiebre, presión, sangre, corazón, pulmón
- respiración, síntoma, diagnóstico, tratamiento
- medicamento, alergia, diabetes, hipertensión
- cardíaco, respiratorio, abdominal, cefalea, mareo

**Usage:**
```tsx
const { medicalTerms } = useEnhancedTranscription();

// Display detected terms
{medicalTerms.map((term, index) => (
  <span key={index} className="medical-term-badge">
    {term}
  </span>
))}
```

## Integration Examples

### Basic Integration
```tsx
import { EnhancedTranscriptionPanel } from '@/components/consultation';

export const MyComponent = () => {
  const handleComplete = (text: string) => {
    // Save transcription to your backend
    console.log('Transcribed:', text);
  };

  return (
    <EnhancedTranscriptionPanel 
      onTranscriptionComplete={handleComplete}
    />
  );
};
```

### Advanced Medical Integration
```tsx
import { useEnhancedTranscription } from '@/hooks';
import { VoiceReactiveMicrophone, LiveTranscriptionDisplay } from '@/components/ui';

export const MedicalConsultation = () => {
  const {
    finalTranscript,
    liveTranscript,
    isRecording,
    audioLevel,
    medicalTerms,
    startTranscription,
    stopTranscription
  } = useEnhancedTranscription({
    medicalOptimization: true,
    language: 'es-ES'
  });

  return (
    <div className="consultation-interface">
      <VoiceReactiveMicrophone 
        audioLevel={audioLevel}
        isRecording={isRecording}
        size="lg"
      />
      
      <LiveTranscriptionDisplay 
        finalTranscript={finalTranscript}
        liveTranscript={liveTranscript}
        isRecording={isRecording}
      />
      
      <div className="medical-terms">
        {medicalTerms.map(term => (
          <span key={term} className="term-badge">{term}</span>
        ))}
      </div>
      
      <button onClick={isRecording ? stopTranscription : startTranscription}>
        {isRecording ? 'Stop' : 'Start'} Recording
      </button>
    </div>
  );
};
```

## Browser Compatibility

**Supported Browsers:**
- Chrome 25+ ✅
- Edge 79+ ✅
- Firefox (limited support) ⚠️
- Safari (limited support) ⚠️

**Requirements:**
- HTTPS connection (required for microphone access)
- Microphone permissions
- Web Speech API support

## Performance Optimization

**Best Practices:**
1. **Limit simultaneous instances**: Only one transcription panel active at a time
2. **Cleanup on unmount**: Hook automatically handles cleanup
3. **Audio level throttling**: Updates limited to reasonable frequency
4. **Memory management**: Automatic cleanup of audio streams

**Configuration for Performance:**
```tsx
const config = {
  realTimeUpdates: true,  // Keep enabled for best UX
  medicalOptimization: true,  // Adds minimal overhead
  audioLevel: true  // Disable if not using visualizations
};
```

## Security Considerations

**Data Privacy:**
- No audio data sent to external servers (browser service)
- Transcriptions stored only in component state
- Clear transcription data on component unmount

**Permissions:**
- Microphone access required
- HTTPS required for microphone API
- User must explicitly grant permissions

## Troubleshooting

**Common Issues:**

1. **No microphone access**
   - Ensure HTTPS connection
   - Check browser permissions
   - Verify microphone hardware

2. **Poor transcription quality**
   - Check microphone volume
   - Reduce background noise
   - Speak clearly and at normal pace

3. **Component not updating**
   - Verify `realTimeUpdates` is enabled
   - Check for JavaScript errors in console

4. **Build errors**
   - Ensure all dependencies installed: `framer-motion`, `@heroicons/react`
   - Check TypeScript configuration

**Debug Mode:**
```tsx
<EnhancedTranscriptionPanel 
  showModelInfo={true}  // Shows debug info in development
/>
```

## Future Enhancements

**Planned Features:**
- Multi-language support
- Offline transcription capability
- Audio file upload transcription
- Custom medical dictionaries
- Speaker identification
- Transcription confidence visualization

## API Reference

See [TypeScript definitions](../src/types/transcription.ts) for complete type information.

**Import Paths:**
```tsx
// Components
import { 
  EnhancedTranscriptionPanel,
  VoiceReactiveMicrophone,
  AudioSpectrum,
  LiveTranscriptionDisplay,
  TranscriptionModelInfo
} from '@/components/ui';

// Hook
import { useEnhancedTranscription } from '@/hooks';

// Types
import type { 
  TranscriptionStatus,
  TranscriptionService,
  EnhancedTranscriptionResult 
} from '@/types/transcription';
```