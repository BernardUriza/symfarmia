import './globals.css'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { AppModeProvider } from './providers/AppModeProvider'
import DemoModeBanner from './components/DemoModeBanner'
import { ThemeProvider } from './providers/ThemeProvider'
import { I18nProvider } from './providers/I18nProvider'
import { PatientContextProvider } from './providers/PatientContextProvider'
import dynamic from 'next/dynamic'
const MedicalAssistant = dynamic(() => import('../src/components/MedicalAssistant'), { ssr: false })
import VersionInfo from './components/VersionInfo'
import { SITE_CONFIG } from './lib/site-config'

export const metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  icons: {
    icon: SITE_CONFIG.favicon,
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.image,
        width: 1200,
        height: 630,
        alt: 'SYMFARMIA - Plataforma médica inteligente',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.image],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <ErrorBoundary>
            <UserProvider>
            <I18nProvider>
              <PatientContextProvider>
                <AppModeProvider>
                  <DemoModeBanner />
                  {children}
                  <MedicalAssistant />
                  
                  {/* Version Info Footer */}
                  <div className="fixed bottom-2 left-2 z-40">
                    <VersionInfo />
                  </div>
                </AppModeProvider>
              </PatientContextProvider>
            </I18nProvider>
            </UserProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}