# Whisper Audio Test Suite

This directory contains test utilities for the Whisper Xenova transcription system.

## Quick Start

1. **Place your WAV file**: Put your `sample.wav` file in this directory
   ```
   /workspaces/symfarmia/public/test-audio/sample.wav
   ```

2. **Browser Test** (Recommended):
   ```bash
   npm run dev
   ```
   Then open: http://localhost:3000/test-audio/whisper-test.html

3. **Command Line Test**:
   ```bash
   cd /workspaces/symfarmia
   node public/test-audio/whisper-test-node.js public/test-audio/sample.wav
   ```

## Files

- `whisper-test.html` - Interactive browser-based test interface
- `whisper-test-node.js` - Node.js command-line test script
- `test-audio-service.ts` - TypeScript test using the actual service
- `download-test-audio.sh` - Script to download test audio files

## Testing Workflow

1. The browser test (`whisper-test.html`) provides:
   - File upload for your WAV files
   - Real-time recording from microphone
   - Model loading progress
   - Transcription results display
   - Worker testing capabilities

2. Features tested:
   - Xenova/whisper-base model loading
   - WAV file transcription
   - Spanish language support
   - Web Worker integration
   - Error handling

## Troubleshooting

If transcription isn't working:

1. **Check browser console** for errors
2. **Verify model loading** - should show download progress
3. **Test with different audio formats** - WAV, WebM, MP3
4. **Check microphone permissions** if recording
5. **Ensure Spanish language** is set in options

## Sample Audio Requirements

For best results with Spanish transcription:
- Format: WAV (16-bit PCM preferred)
- Sample rate: 16kHz or higher
- Channels: Mono or stereo
- Content: Clear Spanish speech
- Duration: 3-30 seconds ideal

## Example Usage

```javascript
// In browser console after loading model:
const file = document.getElementById('audioFile').files[0];
await transcribeFile(); // Will use the selected file
```