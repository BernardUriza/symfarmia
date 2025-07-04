'use client'
import { useTheme } from '../app/providers/ThemeProvider'
import { useTranslation } from '../app/providers/I18nProvider'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'
  return (
    <button
      aria-label="Toggle Theme"
      className={`text-sm font-medium focus:outline-none ${className}`}
      onClick={toggleTheme}
    >
      {isDark ? t('light_mode') : t('dark_mode')}
    </button>
  )
}
