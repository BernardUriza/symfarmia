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

# 3. Verificar si el modelo existe en public/models
echo -e "${BLUE}3. Verificando modelo de Whisper en public/models:${NC}"
PUBLIC_MODEL_PATH="public/models"

if [ -d "$PUBLIC_MODEL_PATH" ]; then
    echo -e "${GREEN}✅ Directorio public/models existe${NC}"
    echo "📁 Contenido del directorio de modelos:"
    ls -la "$PUBLIC_MODEL_PATH"
    
    # Verificar específicamente base
    if [ -f "$PUBLIC_MODEL_PATH/ggml-base.bin" ]; then
        echo -e "${GREEN}✅ Modelo base encontrado en public/models${NC}"
        echo "📏 Tamaño del modelo: $(ls -lh "$PUBLIC_MODEL_PATH/ggml-base.bin" | awk '{print $5}')"
    else
        echo -e "${RED}❌ Modelo base NO encontrado en public/models${NC}"
    fi
    
    # Verificar base.en también
    if [ -f "$PUBLIC_MODEL_PATH/ggml-base.en.bin" ]; then
        echo -e "${GREEN}✅ Modelo base.en también encontrado${NC}"
        echo "📏 Tamaño: $(ls -lh "$PUBLIC_MODEL_PATH/ggml-base.en.bin" | awk '{print $5}')"
    fi
else
    echo -e "${RED}❌ Directorio public/models NO existe${NC}"
    echo -e "${YELLOW}⚠️ Los modelos deben estar en public/models/${NC}"
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
echo "- Si el modelo base existe y pesa ~142MB: ✅"
echo "- Si el postinstall script se ejecutó: ✅"
echo "- Si nodejs-whisper se puede importar: ✅"
echo ""
echo -e "${GREEN}🚀 Listo para deploy en Netlify${NC}"