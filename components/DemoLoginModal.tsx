'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'

interface DemoLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

const DEMO_EMAIL = 'demo@symfarmia.com'
const DEMO_PASSWORD = 'demo123'
const ANIMATION_DURATION = 250 // milliseconds

const DemoLoginModal = ({ isOpen, onClose, onLogin }: DemoLoginModalProps) => {
  const [visible, setVisible] = useState(isOpen)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Handle mount/unmount for fade transitions
  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      return
    }

    const timeout = setTimeout(() => setVisible(false), ANIMATION_DURATION)
    return () => clearTimeout(timeout)
  }, [isOpen])

  // Auto type demo credentials when the modal opens
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
        emailIndex += 1
      } else if (passIndex < DEMO_PASSWORD.length) {
        setPassword(DEMO_PASSWORD.slice(0, passIndex + 1))
        passIndex += 1
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }, 80)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isOpen])

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleBackdrop = (e: any) => {
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
      <div
        className={`relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-lg transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">Demo Login</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={onLogin}
            className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
          >
            Login to Demo
          </button>
        </div>
      </div>
    </div>
  )
}

export default DemoLoginModal

