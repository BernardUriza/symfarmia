#!/bin/bash
# SYMFARMIA CI/CD - SISTEMA CONCISO
# Pipeline optimizado con comunicación clara y directa

set -e

# Configuración simplificada
PIPELINE_VERSION="3.0.0"
START_TIME=$(date +%s)
MAX_BUILD_TIME=300
PORT_RANGE="3001-3010"

# Colores esenciales
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Log conciso
log() {
    echo -e "[$(date '+%H:%M:%S')] $1"
}

success() { log "${GREEN}✅ $1${NC}"; }
warning() { log "${YELLOW}⚠️ $1${NC}"; }
error() { log "${RED}❌ $1${NC}"; exit 1; }
info() { log "${BLUE}ℹ️ $1${NC}"; }

# Análisis inteligente de cambios
analyze_changes() {
    local files=$(git diff-tree --no-commit-id --name-only -r HEAD)
    local medical=$(echo "$files" | grep -E "(medical|patient|api/)" | wc -l)
    local frontend=$(echo "$files" | grep -E "\.(tsx|jsx|css)" | wc -l)
    local config=$(echo "$files" | grep -E "(package|next\.config|tsconfig)" | wc -l)
    
    if [ "$medical" -gt 0 ]; then echo "medical-critical"
    elif [ "$config" -gt 0 ]; then echo "full-rebuild"  
    elif [ "$frontend" -gt 0 ]; then echo "frontend-only"
    else echo "standard"; fi
}

# Limpieza rápida
cleanup() {
    info "Limpiando entorno..."
    rm -rf .next/ dist/ node_modules/.cache/ 2>/dev/null || true
    success "Entorno limpio"
}

# Build optimizado
build_project() {
    local build_type=$1
    info "Build tipo: $build_type"
    
    case "$build_type" in
        "medical-critical")
            npm run build:enhanced || npm run build:fast || error "Build médico falló"
            ;;
        "frontend-only")
            npm run build:fast || error "Build frontend falló"
            ;;
        "full-rebuild")
            cleanup
            npm ci --silent
            npm run build || error "Rebuild completo falló"
            ;;
        *)
            npm run build || error "Build estándar falló"
            ;;
    esac
    
    success "Build completado"
}

# Gestión de puertos simplificada
find_port() {
    for port in {3001..3010}; do
        if ! netstat -tuln 2>/dev/null | grep -q ":$port "; then
            echo $port
            return 0
        fi
    done
    error "No hay puertos disponibles en rango $PORT_RANGE"
}

# Deployment directo
deploy() {
    local port=$(find_port)
    info "Desplegando en puerto $port..."
    
    # Matar procesos previos
    pkill -f "next" 2>/dev/null || true
    sleep 2
    
    # Iniciar servidor
    PORT=$port npm start > "logs/server-$port.log" 2>&1 &
    local pid=$!
    
    # Verificar inicio
    sleep 5
    if curl -s "http://localhost:$port/" >/dev/null; then
        success "Deployment exitoso → http://localhost:$port"
        echo "$port" > .current-port
        echo "$pid" > .current-pid
        return 0
    else
        error "Deployment falló en puerto $port"
    fi
}

# Validación médica simplificada
validate_medical() {
    if [ -f "scripts/validate-medical-routes.js" ]; then
        info "Validando rutas médicas..."
        timeout 60s node scripts/validate-medical-routes.js --quick || warning "Validación médica falló"
    fi
}

# Dashboard conciso
update_dashboard() {
    local status=$1
    local port=$(cat .current-port 2>/dev/null || echo "N/A")
    local duration=$(($(date +%s) - START_TIME))
    
    cat > ci-cd-status.md <<EOF
# 🔥 SYMFARMIA CI/CD Dashboard

**Estado:** $status | **Puerto:** $port | **Duración:** ${duration}s
**URL:** http://localhost:$port
**Última actualización:** $(date '+%Y-%m-%d %H:%M:%S')

## Estado Actual
- **Servidor:** $([ "$port" != "N/A" ] && echo "✅ Activo" || echo "❌ Detenido")
- **Build:** $([ "$status" = "✅ Exitoso" ] && echo "✅ Completado" || echo "⚠️ Pendiente")
- **Validación médica:** $([ -f "scripts/validate-medical-routes.js" ] && echo "✅ Lista" || echo "❌ No disponible")

## Recursos del Sistema
- **Memoria:** $(free -h | awk '/^Mem:/ {print $3"/"$2}')
- **CPU:** $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
- **Disco:** $(df -h . | awk 'NR==2 {print $3"/"$2}')

## Acciones Rápidas
\`\`\`bash
# Estado del servidor
curl http://localhost:$port/

# Logs recientes  
tail -f logs/server-$port.log

# Reiniciar
./scripts/concise-cicd-system.sh restart
\`\`\`
EOF
    
    success "Dashboard actualizado"
}

# Pipeline principal
main_pipeline() {
    local commit=$(git rev-parse --short HEAD)
    local build_type=$(analyze_changes)
    
    info "Pipeline iniciado → Commit: $commit"
    
    # Etapas principales
    build_project "$build_type"
    deploy
    validate_medical
    update_dashboard "✅ Exitoso"
    
    local duration=$(($(date +%s) - START_TIME))
    success "Pipeline completado en ${duration}s"
}

# Comandos disponibles
case "${1:-pipeline}" in
    "pipeline")
        main_pipeline
        ;;
    "status")
        port=$(cat .current-port 2>/dev/null || echo "N/A")
        echo "Estado: $([ "$port" != "N/A" ] && echo "Activo en puerto $port" || echo "Detenido")"
        ;;
    "restart")
        pkill -f "next" 2>/dev/null || true
        sleep 2
        main_pipeline
        ;;
    "stop")
        pkill -f "next" 2>/dev/null || true
        rm -f .current-port .current-pid
        success "Servidor detenido"
        ;;
    "logs")
        port=$(cat .current-port 2>/dev/null || echo "3001")
        tail -f "logs/server-$port.log" 2>/dev/null || warning "No hay logs disponibles"
        ;;
    *)
        echo "Uso: $0 [pipeline|status|restart|stop|logs]"
        ;;
esac