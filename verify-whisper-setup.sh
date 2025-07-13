#!/bin/bash

# Script para verificar la configuración de nodejs-whisper localmente
# Simula lo que pasará en Netlify durante el build

echo "🔍 Verificando configuración de nodejs-whisper..."
echo "=============================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorio actual
CURRENT_DIR=$(pwd)
echo -e "${BLUE}📁 Directorio actual:${NC} $CURRENT_DIR"
echo ""

# 1. Verificar netlify/functions
echo -e "${BLUE}1. Verificando directorio de functions:${NC}"
if [ -d "netlify/functions" ]; then
    echo -e "${GREEN}✅ Directorio netlify/functions existe${NC}"
    
    # Verificar package.json
    if [ -f "netlify/functions/package.json" ]; then
        echo -e "${GREEN}✅ package.json encontrado${NC}"
        echo "📄 Contenido:"
        cat netlify/functions/package.json | jq '.'
    else
        echo -e "${RED}❌ package.json no encontrado${NC}"
    fi
else
    echo -e "${RED}❌ Directorio netlify/functions no existe${NC}"
fi
echo ""

# 2. Simular instalación de dependencias
echo -e "${BLUE}2. Simulando instalación de dependencias:${NC}"
cd netlify/functions
echo "📦 Ejecutando: npm install"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
else
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
fi
echo ""

# 3. Verificar si el modelo se descargó
echo -e "${BLUE}3. Verificando modelo de Whisper:${NC}"
MODEL_PATH="node_modules/nodejs-whisper/lib/whisper/models"

if [ -d "$MODEL_PATH" ]; then
    echo -e "${GREEN}✅ Directorio de modelos existe${NC}"
    echo "📁 Contenido del directorio de modelos:"
    ls -la "$MODEL_PATH"
    
    # Verificar específicamente medium
    if [ -f "$MODEL_PATH/ggml-medium.bin" ]; then
        echo -e "${GREEN}✅ Modelo medium encontrado${NC}"
        echo "📏 Tamaño del modelo: $(ls -lh "$MODEL_PATH/ggml-medium.bin" | awk '{print $5}')"
    else
        echo -e "${RED}❌ Modelo medium NO encontrado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Directorio de modelos no existe${NC}"
    echo "🔄 Intentando descargar modelo manualmente..."
    npx nodejs-whisper download medium
    
    # Verificar de nuevo
    if [ -f "$MODEL_PATH/ggml-medium.bin" ]; then
        echo -e "${GREEN}✅ Modelo descargado exitosamente${NC}"
    else
        echo -e "${RED}❌ No se pudo descargar el modelo${NC}"
    fi
fi
echo ""

# 4. Verificar la estructura esperada
echo -e "${BLUE}4. Estructura de node_modules/nodejs-whisper:${NC}"
if [ -d "node_modules/nodejs-whisper" ]; then
    echo "📂 Contenido principal:"
    ls -la node_modules/nodejs-whisper | head -10
    
    echo ""
    echo "📂 Estructura de lib:"
    if [ -d "node_modules/nodejs-whisper/lib" ]; then
        find node_modules/nodejs-whisper/lib -type d -name "models" -o -name "whisper"
    fi
else
    echo -e "${RED}❌ nodejs-whisper no está instalado${NC}"
fi
echo ""

# 5. Prueba rápida
echo -e "${BLUE}5. Prueba de importación:${NC}"
node -e "
try {
    const { nodewhisper } = require('nodejs-whisper');
    console.log('✅ nodejs-whisper importado correctamente');
    console.log('📦 Tipo:', typeof nodewhisper);
} catch (error) {
    console.error('❌ Error al importar:', error.message);
}
"

# Volver al directorio original
cd "$CURRENT_DIR"

echo ""
echo -e "${YELLOW}📊 Resumen:${NC}"
echo "- Si el modelo medium existe y pesa ~1.5GB: ✅"
echo "- Si el postinstall script se ejecutó: ✅"
echo "- Si nodejs-whisper se puede importar: ✅"
echo ""
echo -e "${GREEN}🚀 Listo para deploy en Netlify${NC}"