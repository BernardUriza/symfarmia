"use client"
import { useAppMode } from '../providers/AppModeProvider';
import { useTranslation } from '../providers/I18nProvider';
import { useEffect, useState } from 'react';

export default function DemoModeBanner() {
  const { isDemoMode, toggleMode } = useAppMode();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isDemoMode) {
    return null;
  }

  return (
    <div className="demo-banner">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="demo-text">
          {t('demo_mode_active')} - {t('demo_mode_desc')}
        </div>
        <div className="demo-buttons flex">
          <button onClick={toggleMode}>{t('switch_live_mode')}</button>
          <button onClick={() => (window.location.href = '?demo=false')}>
            {t('exit_demo')}
          </button>
        </div>
      </div>
    </div>
  );
}