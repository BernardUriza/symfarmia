'use client'
import { useCallback, useEffect, useState } from 'react'
import { logWarn } from '../utils/logger/ProductionLogger'

/**
 * Simplified Brave cache helper.
 * Shows a translucent button in development when Brave is detected.
 * On click it forces a page reload to bypass cache.
 */
export default function BraveCacheBuster() {
  const [visible, setVisible] = useState(false)

  const detectBrave = useCallback(async () => {
    try {
      if (navigator.userAgent.includes('Brave')) return true
      if ((navigator as any).brave?.isBrave) {
        return await (navigator as any).brave.isBrave()
      }
    } catch {
      // ignore detection errors
    }
    return false
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    detectBrave().then(isBrave => {
      if (isBrave) setVisible(true)
    })
  }, [detectBrave])

  const handleReload = () => {
    logWarn('Brave forced reload')
    window.location.reload()
  }

  if (!visible) return null

  return (
    <button
      onClick={handleReload}
      className="fixed bottom-4 right-4 bg-orange-600/70 hover:bg-orange-600 text-white px-3 py-2 text-xs rounded shadow"
      title="Force reload in Brave"
    >
      Brave Reload
    </button>
  )
}
