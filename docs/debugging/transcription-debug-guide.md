# 🔍 Transcription Debug Guide

## 📊 Debug Messages Added

I've added comprehensive debug emoji messages throughout the transcription functions in `/hooks/useTranscription.ts`. This will help trace execution and identify issues quickly.

## 🎯 Emoji Legend

When debugging transcription issues, look for these emojis in the console:

- 🚀 = **Function start** - Beginning of a major function
- ✅ = **Success** - Operation completed successfully  
- ❌ = **Error/Failure** - Something went wrong
- 📊 = **State info** - Current state or data information
- 🎤 = **Microphone** - Related to microphone/permissions
- 📈 = **Audio levels** - Audio monitoring information
- 🌐 = **Network** - API calls and responses
- 💥 = **Critical error** - Major failure that needs attention
- 🧹 = **Cleanup** - Resource cleanup operations
- 🔄 = **Reset** - State reset operations
- ⏱️ = **Timing** - Performance measurements
- 📦 = **Data** - Data chunks or payloads
- 🔊 = **Audio context** - Web Audio API operations

## 📍 Key Debug Points

### 1. **startTranscription()**
- Initial state cleanup
- Microphone permission request
- Stream acquisition
- Audio monitoring setup
- MediaRecorder creation
- Event handler setup
- Recording start
- Error handling

### 2. **MediaRecorder.ondataavailable**
- Chunk size logging
- Total chunks count

### 3. **MediaRecorder.onstop**
- Audio blob creation
- File size calculations
- API call timing
- Response parsing
- Success/error handling
- Cleanup operations

### 4. **setupAudioMonitoring()**
- AudioContext creation
- AnalyserNode setup
- Audio level updates (every 30 frames)

### 5. **stopTranscription()**
- Current state checks
- MediaRecorder stop
- State updates

### 6. **resetTranscription()**
- State reset logging

## 🔬 Debugging Workflow

1. **Open browser console** before starting recording
2. **Look for initialization message**: 
   ```
   🎯 [useTranscription] Hook inicializado con opciones: {...}
   ```

3. **Start recording** and follow the emoji trail:
   ```
   🚀 [startTranscription] Iniciando función de transcripción...
   🧹 [startTranscription] Limpiando estados previos...
   🎤 [startTranscription] Solicitando permisos de micrófono...
   ```

4. **Common issues to look for**:
   - ❌ Microphone permission denied
   - 💥 AudioContext creation failed
   - ❌ API call failed
   - 📏 Audio blob size is 0

5. **Performance metrics**:
   - ⏱️ API response time
   - 📏 Audio file size
   - 📊 Number of chunks

## 🛠️ Troubleshooting

### No audio chunks
Look for: `📦 [ondataavailable] Chunk recibido: 0 bytes`

### API errors
Look for: `❌ [onstop] Error HTTP: {status}`

### Permission issues
Look for: `💥 [startTranscription] Error crítico al iniciar transcripción`

### Audio level issues
Look for: `📈 [updateAudioLevel] Nivel de audio: 0.0/255`

## 💡 Tips

1. **Filter console** by "[startTranscription]" to see only transcription logs
2. **Check chunk sizes** - they should be > 0 bytes
3. **Monitor audio levels** - they should fluctuate when speaking
4. **Watch for cleanup** - all tracks should be stopped properly