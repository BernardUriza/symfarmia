#!/bin/bash

echo "🧪 Testing Whisper Backend Integration"

# 1. Build test
echo "📦 Building project..."
npm run build || exit 1

# 2. Start server
echo "🚀 Starting development server..."
npm run dev &
DEV_PID=$!
sleep 10

# 3. Create a test audio file
echo "🎤 Creating test audio file..."
# Create a simple WAV file using sox or ffmpeg if available
if command -v sox &> /dev/null; then
    sox -n -r 16000 -c 1 test.wav synth 3 sine 440
elif command -v ffmpeg &> /dev/null; then
    ffmpeg -f lavfi -i "sine=frequency=440:duration=3" -ar 16000 -ac 1 test.wav -y
else
    echo "⚠️  No audio generation tool found. Please create test.wav manually."
fi

# 4. Test endpoint
echo "🔄 Testing /api/transcribe endpoint..."
if [ -f "test.wav" ]; then
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/transcribe \
        -F "audio=@test.wav" \
        -H "Accept: application/json")
    
    if [ $? -eq 0 ]; then
        echo "✅ Endpoint response received:"
        echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
        
        # Check if response contains success field
        if echo "$RESPONSE" | grep -q '"success":true'; then
            echo "✅ Transcription successful!"
            TEXT=$(echo "$RESPONSE" | jq -r '.data.text' 2>/dev/null || echo "No text found")
            echo "📝 Transcribed text: $TEXT"
        else
            echo "❌ Transcription failed"
            echo "$RESPONSE"
        fi
    else
        echo "❌ Failed to connect to endpoint"
    fi
else
    echo "❌ Test audio file not found"
fi

# 5. Performance test
echo ""
echo "⚡ Testing performance..."
START_TIME=$(date +%s%N)
curl -s -X POST http://localhost:3000/api/transcribe \
    -F "audio=@test.wav" > /dev/null
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000))
echo "⏱️  Processing time: ${DURATION}ms"

# 6. Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $DEV_PID 2>/dev/null
rm -f test.wav

echo ""
echo "✅ Test completed!"