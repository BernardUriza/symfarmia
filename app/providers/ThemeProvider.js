"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [storedTheme, setStoredTheme] = useLocalStorage('theme', null)
  const [systemTheme, setSystemTheme] = useState('light')

  // Detect system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemTheme = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    updateSystemTheme()
    mq.addEventListener('change', updateSystemTheme)
    return () => mq.removeEventListener('change', updateSystemTheme)
  }, [])

  const theme = storedTheme || systemTheme

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => setStoredTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
