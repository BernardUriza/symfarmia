# 🤖 Whisper Xenova Enhancements

La integración con `@xenova/transformers` ahora es más robusta.

## ✨ Cambios Clave

1. **Reintentos automáticos** al cargar el modelo con `retryCount` y `retryDelay`.
2. **Precarga opcional** mediante el componente `WhisperPreloaderGlobal` o la función `preloadModel` del hook.
3. **Indicador de progreso** durante la descarga usando el parámetro `progress_callback` del pipeline.

## 🚀 Uso Rápido

```jsx
import WhisperPreloaderGlobal from '../domains/medical-ai/components/WhisperPreloaderGlobal';

// En la raíz de tu aplicación
<WhisperPreloaderGlobal />
```

Si prefieres controlar la carga manualmente:

```javascript
const { preloadModel, loadProgress } = useSimpleWhisper({ autoPreload: false });
// Llama a preloadModel() cuando quieras iniciar la descarga
```

## 📁 Archivos Modificados

- `useSimpleWhisper.js` ahora expone `preloadModel` y `loadProgress`.
- Nuevo componente `WhisperPreloaderGlobal.tsx` para realizar la precarga.

Con estas mejoras, la experiencia de usuario es más fluida y se maneja mejor cualquier fallo de red.
