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
import { getSiteConfig } from './lib/site-config'

const siteConfig = getSiteConfig()

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: siteConfig.favicon,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.image,
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
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.image],
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