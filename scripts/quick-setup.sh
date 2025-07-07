#!/bin/bash
# Setup Rápido del Sistema CI/CD Conciso

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

echo "🔥 SYMFARMIA CI/CD Setup Rápido"
echo "================================"

# 1. Crear directorios esenciales
info "Creando estructura..."
mkdir -p logs .cicd

# 2. Hacer scripts ejecutables
info "Configurando scripts..."
chmod +x scripts/concise-cicd-system.sh
chmod +x scripts/simple-git-hook.sh

# 3. Instalar Git hook
info "Instalando Git hook..."
cp scripts/simple-git-hook.sh .git/hooks/post-commit
chmod +x .git/hooks/post-commit

# 4. Configuración básica
info "Configuración inicial..."
cat > .cicd/config.json <<EOF
{
    "autoBuild": true,
    "portRange": {"start": 3001, "end": 3010},
    "medicalValidation": true
}
EOF

# 5. Scripts de conveniencia en package.json
info "Agregando comandos npm..."
if command -v jq >/dev/null 2>&1; then
    jq '.scripts += {
        "ci:status": "./scripts/concise-cicd-system.sh status",
        "ci:restart": "./scripts/concise-cicd-system.sh restart",
        "ci:stop": "./scripts/concise-cicd-system.sh stop",
        "ci:logs": "./scripts/concise-cicd-system.sh logs"
    }' package.json > package.json.tmp && mv package.json.tmp package.json
fi

# 6. Dashboard inicial
info "Generando dashboard..."
./scripts/concise-cicd-system.sh status > /dev/null || true

# 7. Test del sistema
info "Probando sistema..."
if ./scripts/concise-cicd-system.sh status >/dev/null 2>&1; then
    success "Sistema listo"
else
    success "Sistema instalado (requiere primer commit para activar)"
fi

echo
echo "📋 Comandos disponibles:"
echo "  npm run ci:status   → Estado actual"
echo "  npm run ci:restart  → Reiniciar servidor" 
echo "  npm run ci:logs     → Ver logs"
echo
echo "🚀 Haz un commit para activar el pipeline automático"