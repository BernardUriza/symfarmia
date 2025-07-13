#!/bin/bash

# Script de debug para verificar la implementación de transcripción en Netlify
# Uso: ./debug-netlify-transcription.sh [URL_NETLIFY]

URL_BASE="${1:-https://symfarmia.netlify.app}"

echo "🔍 Debug de Transcripción en Netlify"
echo "====================================="
echo "URL Base: $URL_BASE"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar API route GET
echo -e "${BLUE}1. Verificando API Route GET:${NC}"
echo "   GET $URL_BASE/api/transcription"
curl -s "$URL_BASE/api/transcription" | jq '.' || echo -e "${RED}Error al obtener información${NC}"
echo ""

# 2. Verificar Netlify Function Health
echo -e "${BLUE}2. Verificando Netlify Function Health:${NC}"
echo "   GET $URL_BASE/.netlify/functions/health"
curl -s "$URL_BASE/.netlify/functions/health" | jq '.' || echo -e "${RED}Function health no disponible${NC}"
echo ""

# 3. Probar transcripción con archivo de prueba
echo -e "${BLUE}3. Probando transcripción de archivo del servidor:${NC}"
echo "   POST $URL_BASE/.netlify/functions/transcribe-server-file"
curl -s -X POST "$URL_BASE/.netlify/functions/transcribe-server-file" \
  -H "Content-Type: application/json" \
  -d '{"filename": "sample.wav"}' | jq '.' || echo -e "${RED}Error en transcripción${NC}"
echo ""

# 4. Verificar redirect de API
echo -e "${BLUE}4. Verificando redirect (debe ir a Netlify Function):${NC}"
echo "   POST $URL_BASE/api/transcription (con -L para seguir redirects)"
# Crear un archivo temporal para la prueba
echo "Test audio content" > /tmp/test-audio.txt
curl -s -L -X POST "$URL_BASE/api/transcription" \
  -F "audio=@/tmp/test-audio.txt;type=audio/wav" \
  -H "Accept: application/json" | jq '.' || echo -e "${RED}Error en redirect${NC}"
rm -f /tmp/test-audio.txt
echo ""

# 5. Resumen
echo -e "${YELLOW}📊 Resumen de Verificación:${NC}"
echo "- Si el GET de /api/transcription muestra 'Netlify Functions' como service: ✅"
echo "- Si la health check responde con status 'OK': ✅"
echo "- Si transcribe-server-file funciona: ✅"
echo "- Si el POST a /api/transcription NO muestra el error de 'localhost:3001': ✅"
echo ""
echo -e "${GREEN}🎯 Solución aplicada:${NC}"
echo "1. Redirect específico en netlify.toml: /api/transcription -> /.netlify/functions/transcribe-upload"
echo "2. El redirect tiene 'force = true' y está ANTES del redirect genérico de /api/*"
echo "3. La API route ahora detecta Netlify y devuelve info de debug si se ejecuta"