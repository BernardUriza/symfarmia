'use client'
import { useTheme } from '../app/providers/ThemeProvider'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      aria-label="Toggle Theme"
      className={`text-sm font-medium focus:outline-none ${className}`}
      onClick={toggleTheme}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
