'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { logWarn, logError } from '../../../utils/logger/ProductionLogger'

// Throttled logging to prevent excessive console output
const throttledLoggers = new Map()
const getThrottledLogger = (key: string, delay: number = 60000) => {
  if (!throttledLoggers.has(key)) {
    let lastLog = 0
    throttledLoggers.set(key, (message: string, data?: any) => {
      const now = Date.now()
      if (now - lastLog > delay) {
        logWarn(message, data)
        lastLog = now
      }
    })
  }
  return throttledLoggers.get(key)
}

const throttledLogWarn = getThrottledLogger('brave-cache-buster')

/**
 * 🦁 BRAVE CACHE BUSTER - Nuclear Cache Destruction for Development
 * 
 * Brave Browser has more aggressive caching than Chrome
 * This component destroys ALL cache when in development mode
 */
export default function BraveCacheBuster() {
  const [isBrave, setIsBrave] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  
  // Memoize the detection logic to prevent unnecessary re-runs
  const detectBrave = useCallback(async () => {
    try {
      // Method 1: Check user agent
      const userAgentCheck = navigator.userAgent.includes('Brave')
      
      // Method 2: Check for brave API with proper binding
      let braveApiCheck = false
      if ((navigator as any).brave) {
        try {
          // Properly bind the context to avoid "Illegal invocation" error
          const isBraveMethod = (navigator as any).brave.isBrave.bind((navigator as any).brave)
          braveApiCheck = await isBraveMethod()
        } catch (e) {
          logWarn('Brave API check failed', { error: e.message })
        }
      }
      
      const isBraveDetected = userAgentCheck || braveApiCheck
      setIsBrave(isBraveDetected)
      
      return isBraveDetected
    } catch (error) {
      logWarn('Brave detection failed', { error: error.message })
      setIsBrave(false)
      return false
    }
  }, [])
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let timeoutId: NodeJS.Timeout
    
    detectBrave().then(isBraveDetected => {
      if (isBraveDetected && process.env.NODE_ENV === 'development') {
        throttledLogWarn('BRAVE BROWSER DETECTED - cache bust tools enabled')
        // Show instructions after a delay
        timeoutId = setTimeout(() => setShowInstructions(true), 2000)
      }
    })
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [detectBrave])

  const destroyAllCaches = useCallback(async () => {
    try {
      logWarn('DESTROYING ALL BRAVE CACHES') // Keep this one as it's user-initiated
      
      // 1. Clear all storage types
      const storageTypes = ['localStorage', 'sessionStorage']
      storageTypes.forEach(storageType => {
        try {
          if (window[storageType as keyof Window]) {
            (window[storageType as keyof Window] as Storage).clear()
          }
        } catch (e) {
          logWarn(`Failed to clear ${storageType}`, { error: e.message })
        }
      })
      
      // 2. Clear IndexedDB
      try {
        if ('indexedDB' in window) {
          // Get all databases and clear them
          logWarn('Clearing IndexedDB')
        }
      } catch (e) {
        logWarn('Failed to clear IndexedDB', { error: e.message })
      }
      
      // 3. Unregister all service workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          const promises = registrations.map(registration => {
            return registration.unregister()
          })
          await Promise.all(promises)
          if (registrations.length > 0) {
            logWarn(`Unregistered ${registrations.length} service workers`)
          }
        } catch (e) {
          logWarn('Failed to unregister service workers', { error: e.message })
        }
      }
      
      // 4. Clear all caches using Cache API
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          const promises = cacheNames.map(cacheName => {
            return caches.delete(cacheName)
          })
          await Promise.all(promises)
          if (cacheNames.length > 0) {
            logWarn(`Destroyed ${cacheNames.length} caches via Cache API`)
          }
        } catch (e) {
          logWarn('Failed to clear caches', { error: e.message })
        }
      }
      
      // 5. Force garbage collection if available
      // @ts-expect-error - gc is available in some dev environments
      if (window.gc) {
        window.gc()
        // Silent GC, no need to log
      }
      
      logWarn('BRAVE CACHE NUCLEAR DESTRUCTION COMPLETE')
      
    } catch (error) {
      logError('CACHE DESTRUCTION FAILED', error)
    }
  }, [])

  const forceReloadInBrave = useCallback(() => {
    logWarn('FORCE RELOADING IN BRAVE') // Keep this as it's user-initiated
    
    // Multiple reload strategies for Brave
    const strategies = [
      () => {
        // Strategy 1: Hard reload with cache bypass
        window.location.reload()
      },
      () => {
        // Strategy 2: URL with timestamp
        const url = new URL(window.location.href)
        url.searchParams.set('brave_cache_bust', Date.now().toString())
        window.location.href = url.toString()
      },
      () => {
        // Strategy 3: Force new window
        window.open(window.location.href, '_blank')
      }
    ]
    
    // Execute strategies with delays
    strategies.forEach((strategy, index) => {
      setTimeout(strategy, index * 1000)
    })
  }, [])

  const openIncognito = useCallback(() => {
    alert(`🕵️ Para desarrollo sin cache en Brave:
    
1. Presiona Ctrl+Shift+N (Ventana incógnita)
2. O ve a ☰ → New private window
3. Navega a: ${window.location.origin}

¡El modo incógnito evita todos los problemas de cache!`)
  }, [])

  const showBraveDevHelp = useCallback(() => {
    alert(`🦁 BRAVE DEVELOPMENT SETUP:

1. 🛠️ Abrir Developer Tools (F12)
2. 🌐 Ir a pestaña "Network"
3. ✅ Marcar "Disable cache"
4. 🛡️ Brave Shields → Configurar para localhost:
   - Bloquear anuncios: DESACTIVADO
   - Bloquear cookies: DESACTIVADO
   - Bloquear fingerprinting: DESACTIVADO
5. 🔄 Usar Ctrl+Shift+R para recarga forzada

¡O simplemente usa modo incógnito! 🕵️`)
  }, [])

  // Memoize the conditional rendering to prevent unnecessary re-renders
  const shouldRender = useMemo(() => {
    return process.env.NODE_ENV === 'development' && isBrave
  }, [isBrave])
  
  // Only render in development and if Brave is detected
  if (!shouldRender) {
    return null
  }

  return (
    <>
      {/* Brave Development Helper Buttons */}
      <div className="fixed top-16 right-4 z-50 space-y-2">
        <button 
          onClick={forceReloadInBrave}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 text-xs rounded-lg shadow-lg flex items-center gap-2 transition-all"
          title="Forzar recarga destruyendo cache"
        >
          🦁 BRAVE RELOAD
        </button>
        
        <button 
          onClick={openIncognito}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 text-xs rounded-lg shadow-lg flex items-center gap-2 transition-all"
          title="Abrir en modo incógnito"
        >
          🕵️ INCOGNITO
        </button>
        
        <button 
          onClick={showBraveDevHelp}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs rounded-lg shadow-lg flex items-center gap-2 transition-all"
          title="Instrucciones para desarrollo en Brave"
        >
          🛠️ SETUP
        </button>
        
        <button 
          onClick={destroyAllCaches}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs rounded-lg shadow-lg flex items-center gap-2 transition-all"
          title="Destruir toda la cache manualmente"
        >
          💥 NUKE CACHE
        </button>
      </div>

      {/* Brave Development Instructions */}
      {showInstructions && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-400 p-4 rounded-xl max-w-sm shadow-xl z-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🦁</span>
            <h4 className="font-bold text-orange-800">Brave Dev Mode Detected</h4>
          </div>
          
          <div className="text-sm text-orange-700 space-y-2">
            <p className="font-semibold">Cache agresivo detectado! 🚨</p>
            
            <div className="bg-orange-50 p-2 rounded border border-orange-200">
              <p className="font-semibold mb-1">Soluciones rápidas:</p>
              <ul className="text-xs space-y-1">
                <li>🔥 <strong>F12</strong> → Network → ✓ Disable cache</li>
                <li>🛡️ <strong>Brave Shields</strong> → Allow all para localhost</li>
                <li>🔄 <strong>Ctrl+Shift+R</strong> para recarga forzada</li>
                <li>🕵️ <strong>Modo incógnito</strong> (recomendado)</li>
              </ul>
            </div>
            
            <p className="text-xs italic">
              Los botones de arriba te ayudan con cache stubborn 💪
            </p>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button 
              onClick={() => setShowInstructions(false)}
              className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded transition-colors"
            >
              Got it! 👍
            </button>
            <button 
              onClick={openIncognito}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
            >
              Open Incognito 🕵️
            </button>
          </div>
        </div>
      )}
    </>
  )
}