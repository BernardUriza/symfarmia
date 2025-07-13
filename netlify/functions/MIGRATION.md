# Migration from nodejs-whisper to Xenova/transformers.js

## Overview

This migration replaces the C++ binary-based `nodejs-whisper` with the JavaScript-based `@xenova/transformers` library for audio transcription in Netlify Functions. This change was necessary because nodejs-whisper is incompatible with serverless environments due to:

- Binary execution requirements
- File system dependencies
- Memory constraints
- Process spawning limitations

## What Changed

### 1. Dependencies
- **Before**: `nodejs-whisper` (C++ wrapper for whisper.cpp)
- **After**: `@xenova/transformers` (JavaScript/WebAssembly implementation)

### 2. Model
- **Before**: ggml-base.bin (binary model files)
- **After**: Xenova/whisper-tiny (ONNX model, 39MB)

### 3. Module System (January 2025)
- **Before**: CommonJS (`require`, `module.exports`)
- **After**: ES Modules (`import`, `export`)
- Added `"type": "module"` to package.json
- Updated all function files to use ESM syntax

### 4. Audio Processing
- **Before**: Files saved to temp directory then processed
- **After**: Direct buffer processing without file I/O
- Improved serverless performance by eliminating file system operations

### 5. Performance Optimizations
- Global pipeline caching for warm starts
- Disabled timestamps for better performance
- Configured /tmp cache directory
- 180-second timeout with 3GB memory allocation
- Removed unnecessary console.log statements
- Direct buffer processing for faster transcription

## API Compatibility

The migration maintains 100% backward compatibility with the original API:

### `/api/transcription` (Upload Endpoint)
```json
{
  "success": true,
  "filename": "audio.wav",
  "original_name": "audio.wav",
  "transcript": "Transcribed text here",
  "processing_time_ms": 1234,
  "file_size": 123456,
  "model_used": "Xenova/whisper-tiny (Transformers.js)",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "confidence": 0.95,
  "language": "es"
}
```

### `/api/transcribe-server-file` (Server File Endpoint)
```json
{
  "success": true,
  "filename": "sample.wav",
  "transcript": "Transcribed text",
  "raw_result": {
    "text": "Transcribed text",
    "chunks": []
  },
  "processing_time_ms": 1234,
  "audio_path": "/path/to/audio",
  "model_used": "Xenova/whisper-tiny (Transformers.js)",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "file_size_mb": "1.23",
  "language": "es"
}
```

## Testing Backward Compatibility

Run the compatibility test script:

```bash
# Test against local Netlify dev
npm install form-data node-fetch
node scripts/test-transcription-compatibility.js

# Test against production
node scripts/test-transcription-compatibility.js --production
```

## Key Improvements

1. **Serverless Compatible**: Works in AWS Lambda environment
2. **Better Cold Starts**: JavaScript initialization vs binary loading
3. **Consistent Performance**: No file system race conditions
4. **Enhanced Error Handling**: Categorized error responses
5. **Smaller Footprint**: 39MB model vs 150MB+ binary models

## Deployment

The functions are configured in `netlify.toml` with:
- Maximum timeout: 180 seconds
- Maximum memory: 3008MB
- Optimized bundling with esbuild

## Rollback Plan

If issues arise, rollback by:
1. Revert the changes in this commit
2. Restore the original `nodejs-whisper` dependencies
3. Note: This will break Netlify deployment - only for local development

## Future Enhancements

1. Upgrade to larger models (base, small) as needed
2. Add streaming support for real-time transcription
3. Implement caching for frequently transcribed files
4. Add support for multiple concurrent transcriptions