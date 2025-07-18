# LLM Audit API Documentation

## Overview

The LLM Audit API integrates ChatGPT (OpenAI) to process, audit, and enhance medical transcriptions. It provides intelligent fusion of multiple transcription sources, speaker diarization, and medical terminology correction.

## API Endpoint

### POST `/api/llm-audit`

Processes a medical transcription with ChatGPT to improve accuracy and assign speakers.

#### Request Body

```typescript
{
  "transcript": string,        // Required: Main transcription text (from Whisper)
  "webSpeech"?: string,       // Optional: WebSpeech API transcription for comparison
  "diarization"?: Array<{     // Optional: Speaker diarization segments
    "start": number,
    "end": number,
    "speaker"?: string
  }>,
  "task": "audit-transcript" | "diarize"  // Task type (default: "audit-transcript")
}
```

#### Response

```typescript
{
  "success": boolean,
  "data"?: {
    "mergedTranscript": string,     // Audited and corrected transcription
    "speakers": Array<{             // Speaker-assigned segments
      "start": number,
      "end": number,
      "speaker": "Doctor" | "Paciente" | "Unknown",
      "text": string
    }>,
    "summary"?: string,             // Clinical summary
    "gptLogs"?: string[]           // Processing decisions made by GPT
  },
  "error"?: string                  // Error message if failed
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/llm-audit \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "doctor buenos dias como esta usted hoy vengo porque me duele mucho la garganta",
    "task": "audit-transcript"
  }'
```

### GET `/api/llm-audit/metrics`

Returns health metrics and statistics for the LLM service.

#### Response

```json
{
  "metrics": {
    "totalCalls": 100,
    "successfulCalls": 95,
    "failedCalls": 5,
    "cacheHits": 30,
    "cacheMisses": 70,
    "totalTokens": 50000,
    "averageLatency": 2500,
    "errors": {},
    "lastUpdated": "2025-01-18T10:00:00Z"
  },
  "health": {
    "status": "healthy",
    "successRate": 95,
    "cacheHitRate": 30,
    "averageLatency": 2500
  },
  "cache": {
    "size": 20,
    "maxSize": 100
  }
}
```

## React Hook Usage

### `useLlmAudit`

```typescript
import { useLlmAudit } from '@/app/hooks/useLlmAudit'

function MyComponent() {
  const { 
    auditTranscript, 
    isLoading, 
    error, 
    result, 
    reset,
    retryCount 
  } = useLlmAudit()

  const handleAudit = async () => {
    const auditResult = await auditTranscript({
      transcript: "transcription text...",
      webSpeech: "optional webspeech text...",
      diarization: [...],
      task: "audit-transcript"
    })
    
    console.log(auditResult.mergedTranscript)
  }
}
```

## Features

### 1. **Intelligent Text Fusion**
- Combines Whisper and WebSpeech transcriptions
- Resolves conflicts using medical context
- Preserves clinical accuracy

### 2. **Speaker Diarization**
- Assigns "Doctor" or "Paciente" labels
- Uses context clues and diarization data
- Maintains conversation flow

### 3. **Medical Terminology Correction**
- Fixes common transcription errors
- Standardizes medical terms
- Maintains clinical meaning

### 4. **Automatic Retry Logic**
- Up to 3 retry attempts
- 1-second delay between retries
- 30-second request timeout

### 5. **Response Caching**
- 15-minute TTL by default
- LRU eviction (100 entries max)
- Reduces API calls and costs

### 6. **Metrics & Monitoring**
- Tracks success/failure rates
- Monitors token usage
- Measures API latency

## Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...           # Your OpenAI API key

# Optional
OPENAI_MODEL=gpt-4-turbo-preview    # Model to use (default: gpt-4-turbo-preview)
OPENAI_MAX_TOKENS=4000              # Max tokens per request (default: 4000)
```

### Cache Settings

Modify in `/app/services/llmCache.ts`:
- `maxSize`: Maximum cached entries (default: 100)
- `defaultTTL`: Cache time-to-live in ms (default: 900000 / 15 min)

## Error Handling

The API handles various error scenarios:

1. **Missing API Key**: Returns 500 with configuration error
2. **Invalid Request**: Returns 400 with validation error
3. **OpenAI API Errors**: Returns appropriate status with error details
4. **Timeout**: Hook retries automatically
5. **Parse Errors**: Falls back to original transcript

## Testing

### Test Scripts

```bash
# Simple test
node app/api/llm-audit/test-simple.js

# Comprehensive test suite
node app/api/llm-audit/test-epic.js
```

### Manual Testing

1. Start the development server: `npm run dev`
2. Navigate to the conversation capture page
3. Record audio and stop to trigger automatic auditing
4. Check the popup for audited results

## Cost Considerations

- Each API call uses tokens (input + output)
- Caching reduces redundant calls
- Monitor usage via `/api/llm-audit/metrics`
- Consider implementing rate limiting for production

## Security

- API key stored in environment variables only
- Never exposed to client-side code
- All requests validated on server
- Consider adding authentication for production

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure `OPENAI_API_KEY` is set in `.env.local`
   - Restart the development server

2. **Timeout errors**
   - Check network connectivity
   - Verify OpenAI service status
   - Review request size (may be too large)

3. **Parse errors**
   - Check OpenAI model response format
   - Verify prompt is requesting JSON output
   - Review temperature settings

### Debug Mode

Enable detailed logging:
```javascript
// In your component
const result = await auditTranscript({...})
console.log('Full LLM response:', result)
```

## Future Enhancements

- [ ] Streaming responses for real-time feedback
- [ ] Multi-language support
- [ ] Custom prompt templates
- [ ] WebSocket integration for live transcription
- [ ] Batch processing for multiple transcripts
- [ ] Fine-tuned medical models