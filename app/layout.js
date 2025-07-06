import './globals.css'
import { Inter } from 'next/font/google'
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

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SYMFARMIA',
  description: 'Intelligent platform for independent doctors',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100`}>
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