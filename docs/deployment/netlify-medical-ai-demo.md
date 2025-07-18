# Netlify Deployment Guide for Medical AI Demo

## 502 Bad Gateway Fix

The medical-ai-demo page requires OpenAI API configuration to function properly. Without these environment variables, the page will return a 502 Bad Gateway error.

### Required Environment Variables

Add these environment variables in Netlify Dashboard > Site Settings > Environment Variables:

```bash
# Required for medical AI transcription features
OPENAI_API_KEY=your_openai_api_key_here

# Optional (defaults shown)
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
```

### How to Add Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to Site configuration > Environment variables
3. Click "Add a variable"
4. Add each variable with its key and value
5. Save and redeploy your site

### API Dependencies

The medical-ai-demo page uses these API endpoints that require OpenAI:

- `/api/llm-audit` - Called by ConversationCapture component for transcript auditing
- `/api/medical-openai` - Called by medical AI services for processing

Without `OPENAI_API_KEY`, these endpoints return 500 errors, which Netlify translates to 502 Bad Gateway.

### Verification

After adding the environment variables and redeploying:

1. Visit https://symfarmia.netlify.app/medical-ai-demo
2. The page should load without errors
3. Audio transcription features should work properly

### Other Medical AI Features

Some features may also require:
- `HUGGINGFACE_TOKEN` - For Hugging Face model access (if using local models)

### Troubleshooting

If you still see 502 errors after adding environment variables:

1. Check Netlify function logs for specific error messages
2. Ensure the API key is valid and has proper permissions
3. Verify the deployment includes all necessary files
4. Check that the build completed successfully