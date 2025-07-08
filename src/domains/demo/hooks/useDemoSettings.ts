import { useState, useCallback } from 'react';

interface DemoSettings {
  language: string;
  autoTranscription: boolean;
  showConfidence: boolean;
  medicalSpecialty: string;
  voiceEnabled: boolean;
}

export const useDemoSettings = () => {
  const [settings, setSettings] = useState<DemoSettings>({
    language: 'es',
    autoTranscription: true,
    showConfidence: true,
    medicalSpecialty: 'general',
    voiceEnabled: true
  });

  const updateSetting = useCallback((key: keyof DemoSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({
      language: 'es',
      autoTranscription: true,
      showConfidence: true,
      medicalSpecialty: 'general',
      voiceEnabled: true
    });
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings
  };
};

export default useDemoSettings;