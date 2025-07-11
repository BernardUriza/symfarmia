'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700">
            Página no encontrada
          </h2>
          <p className="text-lg text-gray-600">
            Lo sentimos, la página que está buscando no existe o ha sido movida.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Sistema Médico SYMFARMIA</strong>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Será redirigido al inicio en {countdown} segundos...
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Ir al Inicio
            </Link>
            
            <Link
              href="/medical"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Portal Médico
            </Link>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Enlaces rápidos:
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/patients" className="text-blue-600 hover:text-blue-800 underline">
                Pacientes
              </Link>
              <Link href="/reports" className="text-blue-600 hover:text-blue-800 underline">
                Reportes
              </Link>
              <Link href="/studies" className="text-blue-600 hover:text-blue-800 underline">
                Estudios
              </Link>
              <Link href="/categories" className="text-blue-600 hover:text-blue-800 underline">
                Categorías
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Si continúa experimentando problemas, por favor contacte al soporte técnico.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Error Code: 404 | {new Date().toISOString()}
          </p>
        </div>
      </div>
    </div>
  )
}