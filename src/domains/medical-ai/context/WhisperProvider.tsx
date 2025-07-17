import React, { createContext, useContext } from 'react';
import { useSimpleWhisper } from '../hooks/useSimpleWhisper';

interface WhisperContextValue {
  startTranscription: () => Promise<boolean>;
  stopTranscription: () => Promise<boolean>;
  resetTranscription: () => void;
  transcription: string | null;
  status: string;
}

const WhisperContext = createContext<WhisperContextValue | undefined>(undefined);

export const WhisperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const whisper = useSimpleWhisper();

  return (
    <WhisperContext.Provider
      value={{
        startTranscription: whisper.startTranscription,
        stopTranscription: whisper.stopTranscription,
        resetTranscription: whisper.resetTranscription,
        transcription: whisper.transcription?.text || null,
        status: whisper.status
      }}
    >
      {children}
    </WhisperContext.Provider>
  );
};

export const useWhisper = (): WhisperContextValue => {
  const ctx = useContext(WhisperContext);
  if (!ctx) throw new Error('useWhisper must be used within WhisperProvider');
  return ctx;
};
