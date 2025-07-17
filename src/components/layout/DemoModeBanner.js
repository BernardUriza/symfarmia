"use client"
import { useAppMode } from '../../providers/AppModeProvider';
import { useTranslation } from '../../providers/I18nProvider';
import dynamic from 'next/dynamic';

function DemoBannerContent() {
  const { isDemoMode, toggleMode } = useAppMode();
  const { t } = useTranslation();

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="demo-banner glass dark:glass-dark" role="status" aria-live="polite">
      <span className="demo-emoji" role="img" aria-label="demo">🧪</span>
      <span className="demo-text text-sm font-medium">{t('demo.mode_active')}</span>
      <button onClick={toggleMode} title={t('demo.switch_live_mode')}>×</button>
    </div>
  );
}

// Use dynamic import with SSR disabled to prevent hydration mismatch
const DemoModeBanner = dynamic(() => Promise.resolve(DemoBannerContent), {
  ssr: false
});

export default DemoModeBanner;