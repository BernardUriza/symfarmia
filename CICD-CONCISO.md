# 🔥 SYMFARMIA CI/CD - Sistema Conciso

Sistema CI/CD optimizado con comunicación clara y directa.

## 🚀 Setup Rápido

```bash
# Instalación en un comando
./scripts/quick-setup.sh

# Primer commit activa el sistema
git add . && git commit -m "feat: activar CI/CD conciso"
```

## 📊 Comandos Principales

```bash
# Estado actual
npm run ci:status

# Reiniciar servidor
npm run ci:restart  

# Ver logs en tiempo real
npm run ci:logs

# Parar servidor
npm run ci:stop
```

## 🔄 Flujo Automático

**En cada commit:**
1. **Hook Git** → Detecta cambios
2. **Análisis** → Determina tipo de build  
3. **Build** → Ejecuta según tipo detectado
4. **Deploy** → Servidor en puerto disponible
5. **Validación** → Rutas médicas (si aplica)
6. **Dashboard** → Actualización automática

## 🏗️ Tipos de Build

| Cambios Detectados | Tipo de Build | Comando |
|-------------------|---------------|---------|
| Archivos médicos/API | `medical-critical` | `npm run build:enhanced` |
| Solo frontend | `frontend-only` | `npm run build:fast` |
| Configuración | `full-rebuild` | Limpieza + `npm run build` |
| Otros | `standard` | `npm run build` |

## 🎯 Dashboard en Tiempo Real

El archivo `ci-cd-status.md` se actualiza automáticamente con:
- **Estado actual** del servidor
- **Puerto activo** y URL
- **Recursos del sistema** 
- **Comandos rápidos**

## 🩺 Validaciones Médicas

Cuando se detectan cambios en archivos médicos:
- **Validación automática** de rutas críticas
- **Verificación** de endpoints API
- **Checks de compliance** básicos

## 🔧 Configuración

Archivo `.cicd/config.json`:
```json
{
    "autoBuild": true,
    "portRange": {"start": 3001, "end": 3010}, 
    "medicalValidation": true
}
```

## 📝 Logs y Monitoreo

```bash
# Logs del servidor actual
tail -f logs/server-[puerto].log

# Logs del Git hook
tail -f logs/git-hook-[fecha].log

# Estado de recursos
free -h && df -h
```

## ⚡ Troubleshooting Rápido

**Servidor no arranca:**
```bash
npm run ci:stop && npm run ci:restart
```

**Puerto ocupado:**
```bash
# El sistema encuentra automáticamente un puerto libre (3001-3010)
npm run ci:status  # Verificar puerto actual
```

**Build falla:**
```bash
# Ver logs específicos
npm run ci:logs

# Build manual de emergencia  
npm run build:fast
```

## 🎖️ Ventajas del Sistema Conciso

✅ **Comunicación clara** - Mensajes directos y accionables  
✅ **Setup rápido** - Un comando instala todo  
✅ **Comandos unificados** - `npm run ci:*` para todo  
✅ **Dashboard simple** - Estado en un vistazo  
✅ **Logs organizados** - Fácil debugging  
✅ **Auto-recovery** - Gestión inteligente de errores  

---

**Sistema activado automáticamente con cada commit** 🚀