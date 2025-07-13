# Transcription File Path Fix - Unit Tests

This document describes the unit tests integrated into the build guardian system that validate the transcription file path fix.

## 🧪 Test Suite Location
The tests are integrated into `/scripts/microservice-e2e-guardian.js` as part of the build guardian system.

## 📋 Tests Performed

### 1. **Uploads Directory Test** (`testUploadsDirectory`)
- ✅ Verifies the uploads directory exists at `/microservices/susurro-test/uploads/`
- ✅ Tests that the directory is writable
- ✅ Uses absolute paths to prevent ENOENT errors

### 2. **Server File Transcription Test** (`testServerFileTranscription`)
- ✅ Tests transcription of existing server files
- ✅ Verifies the `/api/transcribe-server-file` endpoint
- ✅ Confirms transcription contains expected content

### 3. **File Upload Transcription Test** (`testFileUploadTranscription`)
- ✅ Tests file upload via multipart/form-data
- ✅ Verifies the `/api/transcribe-upload` endpoint
- ✅ Confirms file is saved with absolute path handling
- ✅ Validates the uploaded file exists at the expected location

## 🏃 Running the Tests

The tests run automatically as part of the build guardian:

```bash
# Run build guardian (includes all tests)
npm run build:guardian

# Run just the microservice E2E tests
node scripts/microservice-e2e-guardian.js
```

## 🎯 What These Tests Validate

1. **File Path Resolution**: Ensures absolute paths are used, preventing "ENOENT: no such file or directory" errors
2. **Directory Creation**: Verifies uploads directory exists and is created on startup
3. **File Upload Flow**: Tests the complete flow from Next.js API to microservice
4. **Multer Configuration**: Validates that multer saves files to the correct absolute path

## 🔍 Test Output Example

```
🔬 Running microservice E2E tests...
   Including file path fix validation tests...
🔬 MICROSERVICE E2E GUARDIAN ACTIVATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Whisper microservice already running
🧪 Running transcription E2E test...
   1️⃣  Verifying server health...
   ✅ Server is healthy
   2️⃣  Testing uploads directory handling...
   ✅ Uploads directory exists and is writable: /workspaces/symfarmia/microservices/susurro-test/uploads
   ✅ Uploads directory test passed
   3️⃣  Checking test audio file...
   ✅ Test file found
   4️⃣  Running server file transcription...
   ✅ Server file transcription completed in 523ms
   📝 Transcript: "And so my fellow Americans, ask not what your..."
   ✅ Server file transcription passed
   5️⃣  Testing file upload transcription...
   ✅ File upload transcription completed in 489ms
   📝 Transcript: "And so my fellow Americans, ask not what your..."
   📁 Uploaded as: 1752371423567-test-audio.wav
   ✅ File saved correctly at: /workspaces/symfarmia/microservices/susurro-test/uploads/1752371423567-test-audio.wav
   ✅ File upload transcription passed
   6️⃣  Verifying transcripts...
   ✅ Both transcripts contain "Americans" - TESTS PASSED!
```

## ❌ Common Failure Scenarios

1. **Uploads Directory Missing**
   - Error: `Uploads directory not found`
   - Fix: Directory is automatically created on server startup

2. **File Not Found After Upload**
   - Error: `Uploaded file not found at expected path`
   - Fix: Multer now uses absolute paths

3. **Directory Not Writable**
   - Error: `Uploads directory not writable`
   - Fix: Check directory permissions

## 🛡️ Integration with Build Guardian

These tests are part of the build guardian's microservice validation phase:
- They run before every build
- They run before starting the dev server
- Failures block the build/dev process until fixed
- Clear error messages guide developers to the solution