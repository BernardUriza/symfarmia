'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../providers/I18nProvider'

interface DemoLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

const DEMO_EMAIL = 'demo@symfarmia.com'
const DEMO_PASSWORD = 'demo123'
const ANIMATION_DURATION = 250

const DemoLoginModal = ({ isOpen, onClose, onLogin }: DemoLoginModalProps) => {
  const [visible, setVisible] = useState(isOpen)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      return
    }
    const timeout = setTimeout(() => setVisible(false), ANIMATION_DURATION)
    return () => clearTimeout(timeout)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    setEmail('')
    setPassword('')
    let emailIndex = 0
    let passIndex = 0

    intervalRef.current = setInterval(() => {
      if (emailIndex < DEMO_EMAIL.length) {
        setEmail(DEMO_EMAIL.slice(0, emailIndex + 1))
        emailIndex++
      } else if (passIndex < DEMO_PASSWORD.length) {
        setPassword(DEMO_PASSWORD.slice(0, passIndex + 1))
        passIndex++
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }, 80)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!visible) return null

  return (
    <div
      onClick={handleBackdrop}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('demo_login')}</h2>
          <p className="text-gray-600 text-sm">
            {t('auto_fill_demo')}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={onLogin}
            className="w-full py-3 px-4 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            {t('login_demo')}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {t('demo_mode_full_access')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DemoLoginModal
