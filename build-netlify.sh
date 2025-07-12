#!/bin/bash

echo "🚀 Iniciando build para Netlify..."

# Limpiar cache
echo "🧹 Limpiando cache..."
rm -rf .next node_modules/.cache

# Reinstalar sharp para linux
echo "📦 Reinstalando sharp para Linux..."
npm uninstall sharp --silent
npm install sharp@0.32.6 --platform=linux --arch=x64 --silent

# Build de Next.js
echo "🏗️ Building Next.js..."
npm run build

echo "✅ Build completado exitosamente"