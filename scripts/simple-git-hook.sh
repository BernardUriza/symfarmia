#!/bin/bash
# Git Hook Conciso - Post-Commit
# Activación automática del pipeline CI/CD

# Configuración mínima
AUTO_BUILD=${AUTO_BUILD:-true}
LOG_FILE="logs/git-hook-$(date +%Y%m%d).log"

# Log simple
log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar si está habilitado
[ "$AUTO_BUILD" != "true" ] && {
    log "Auto-build deshabilitado"
    exit 0
}

# Crear directorio de logs
mkdir -p logs

# Información del commit
COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git branch --show-current)
AUTHOR=$(git log -1 --pretty=%an)

log "🚀 Pipeline activado → $COMMIT por $AUTHOR en $BRANCH"

# Ejecutar pipeline
if [ -f "./scripts/concise-cicd-system.sh" ]; then
    chmod +x ./scripts/concise-cicd-system.sh
    ./scripts/concise-cicd-system.sh pipeline
else
    log "❌ Sistema CI/CD no encontrado"
    exit 1
fi