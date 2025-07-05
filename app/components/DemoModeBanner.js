"use client"
import { useAppMode } from '../providers/AppModeProvider';
import { useTranslation } from '../providers/I18nProvider';

export default function DemoModeBanner() {
  const { isDemoMode, toggleMode } = useAppMode();
  const { t } = useTranslation();

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <div className="demo-text">
          {t('demo_mode_active')}
        </div>
        <div className="demo-buttons">
          <button onClick={toggleMode} title={t('switch_live_mode')}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}