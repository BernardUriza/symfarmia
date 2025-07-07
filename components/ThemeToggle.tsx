'use client'
import { useTheme } from '../app/providers/ThemeProvider'
import { useTranslation } from '../app/providers/I18nProvider'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t('light_mode') : t('dark_mode')}
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? 'bg-slate-700' : 'bg-yellow-300'
      } ${className}`}
    >
      <span className="sr-only">{isDark ? t('light_mode') : t('dark_mode')}</span>
      <span
        className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow transform transition-all duration-300 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        } hover:scale-110`}
      >
        <SunIcon
          className={`h-4 w-4 text-yellow-500 transition-transform duration-300 ${
            isDark ? 'scale-0 rotate-45' : 'scale-100 rotate-0'
          }`}
        />
        <MoonIcon
          className={`absolute h-4 w-4 text-slate-700 transition-transform duration-300 ${
            isDark ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'
          }`}
        />
      </span>
    </button>
  )
}
