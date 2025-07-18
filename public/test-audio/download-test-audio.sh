#!/bin/bash

# Script to download test audio files for Whisper testing

echo "🎵 Downloading test audio files..."

# Create samples directory
mkdir -p samples

# Download a Spanish speech sample (public domain)
echo "📥 Downloading Spanish speech sample..."
curl -L "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" -o samples/test-bell.wav 2>/dev/null

# You can also record your own test audio:
echo ""
echo "💡 To create your own test audio:"
echo "   1. Use any audio recorder to record Spanish speech"
echo "   2. Save as WAV format (16-bit, mono preferred)"
echo "   3. Place in public/test-audio/samples/"
echo ""
echo "📝 Example test phrases to record:"
echo "   - 'Hola, esto es una prueba de transcripción'"
echo "   - 'El paciente presenta síntomas de gripe'"
echo "   - 'La presión arterial es ciento veinte sobre ochenta'"
echo ""

# Generate a test tone using sox if available
if command -v sox &> /dev/null; then
    echo "🔊 Generating test tone with sox..."
    sox -n samples/test-tone.wav synth 3 sine 440
    echo "✅ Generated test-tone.wav"
else
    echo "ℹ️  Install sox to generate test tones: sudo apt-get install sox"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To test transcription:"
echo "   1. Open http://localhost:3000/test-audio/whisper-test.html in browser"
echo "   2. Or run: node public/test-audio/whisper-test-node.js samples/your-audio.wav"
echo ""