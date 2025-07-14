import { useEffect } from 'react';
import { useSimpleWhisper } from '../hooks/useSimpleWhisper';

/**
 * WhisperPreloader Component
 *
 * Preloads the Xenova Whisper model outside of the main UI.
 */
export default function WhisperPreloader({ retryCount = 3, retryDelay = 1000 }) {
  const { preloadModel, loadProgress, engineStatus } = useSimpleWhisper({
    autoPreload: false,
    retryCount,
    retryDelay,
  });

  useEffect(() => {
    preloadModel();
  }, [preloadModel]);

  if (engineStatus === 'loading') {
    return (
      <div className="p-2 text-sm text-gray-600">
        Cargando modelo Whisper... {Math.round(loadProgress * 100)}%
      </div>
    );
  }

  return null;
}
