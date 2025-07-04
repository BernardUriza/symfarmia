import './globals.css'
import { Inter } from 'next/font/google'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { AppModeProvider } from './providers/AppModeProvider'
import DemoModeBanner from './components/DemoModeBanner'
import { I18nProvider } from './providers/I18nProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SYMFARMIA',
  description: 'Intelligent platform for independent doctors',
  icons: {
    icon: '/symfarmia.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{backgroundColor: "#F9FAFB"}}>
        <ErrorBoundary>
          <UserProvider>
            <I18nProvider>
              <AppModeProvider>
                <DemoModeBanner />
                {children}
              </AppModeProvider>
            </I18nProvider>
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}