'use client'
import { useTheme } from '../../providers/ThemeProviderBulletproof'
import { useTranslation } from '../../providers/I18nProvider'
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
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 backdrop-blur-sm border shadow-lg hover:shadow-xl ${
        isDark 
          ? 'bg-slate-700/90 border-slate-600 hover:bg-slate-600/90' 
          : 'bg-amber-600/90 border-amber-500 hover:bg-amber-500/90'
      } ${className}`}
      title={isDark ? t('light_mode') : t('dark_mode')}
    >
      <span className="sr-only">{isDark ? t('light_mode') : t('dark_mode')}</span>
      <span
        className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transform transition-all duration-300 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        } hover:scale-110`}
      >
        <SunIcon
          className={`h-4 w-4 text-amber-600 transition-transform duration-300 ${
            isDark ? 'scale-0 rotate-45' : 'scale-100 rotate-0'
          }`}
        />
        <MoonIcon
          className={`absolute h-4 w-4 text-slate-800 transition-transform duration-300 ${
            isDark ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'
          }`}
        />
      </span>
    </button>
  )
}
