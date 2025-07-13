# 🔧 Fix para nodejs-whisper en Netlify Functions

## 🐛 Problema Identificado

El error 502 se debía a que el modelo de Whisper (`tiny.en`) no se estaba descargando durante el build de Netlify. `nodejs-whisper` requiere descargar los modelos binarios por separado después de la instalación del paquete.

## ✅ Solución Implementada

### 1. **Comando de Build Actualizado** (`netlify.toml`)

```toml
[build]
  command = "echo '🔍 Starting build...' && npm install && echo '📦 Installing function deps...' && cd netlify/functions && npm install && echo '⬇️ Downloading Whisper model...' && npx nodejs-whisper download tiny.en && echo '✅ Model downloaded, building app...' && cd ../.. && npm run build"
```

Este comando:
1. Instala dependencias del proyecto principal
2. Navega a `netlify/functions/` e instala sus dependencias
3. **Descarga el modelo tiny.en** usando `npx nodejs-whisper download tiny.en`
4. Regresa al root y ejecuta el build normal

### 2. **Postinstall Script** (`netlify/functions/package.json`)

```json
{
  "scripts": {
    "postinstall": "echo '📥 Running postinstall - downloading Whisper model...' && npx nodejs-whisper download tiny.en && echo '✅ Whisper model downloaded successfully'"
  }
}
```

Como respaldo, el postinstall script también descarga el modelo después de instalar las dependencias.

### 3. **Logs de Debug** (en las functions)

Se agregaron logs detallados para verificar:
- Si el directorio de modelos existe
- Si el modelo `tiny.en` está presente
- Información adicional en caso de errores

### 4. **Redirect Específico** (`netlify.toml`)

```toml
[[redirects]]
  from = "/api/transcription"
  to = "/.netlify/functions/transcribe-upload"
  status = 200
  force = true
```

Evita que el código de Next.js intente hacer proxy a localhost:3001 en producción.

## 🧪 Verificación

### Local:
```bash
# Verificar setup localmente
./verify-whisper-setup.sh
```

### En Netlify:

1. **Durante el Build**: Buscar en los logs:
   ```
   ⬇️ Downloading Whisper model...
   ✅ Model downloaded, building app...
   ```

2. **En Runtime**: Los logs de la function mostrarán:
   ```
   📁 Models directory contents: ggml-tiny.en.bin
   ```

## 📊 Resultado Esperado

- El modelo `tiny.en` (~39MB) se descarga durante el build
- Las Netlify Functions pueden usar `nodejs-whisper` correctamente
- La transcripción funciona sin errores 502

## 🎯 Puntos Clave

1. **No era necesario cambiar a transformers.js** - Solo faltaba descargar el modelo
2. **El modelo se descarga en build time** - No en runtime (importante para performance)
3. **Los logs ayudan a debuggear** - Si falla, los logs mostrarán exactamente dónde

## 🚀 Deploy

Después de estos cambios, el próximo deploy en Netlify debería:
1. Descargar el modelo durante el build
2. Incluir el modelo en el bundle de las functions
3. Funcionar correctamente sin errores 502