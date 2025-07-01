import './globals.css'
import { Inter } from 'next/font/google'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { AppModeProvider } from './providers/AppModeProvider'
import DemoModeBanner from './components/DemoModeBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SYMFARMIA',
  description: 'Intelligent platform for independent doctors',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{backgroundColor: "#F9FAFB"}}>
        <ErrorBoundary>
          <AppModeProvider>
            <DemoModeBanner />
            {children}
          </AppModeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}