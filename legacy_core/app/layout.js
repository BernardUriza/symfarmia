import './globals.css'
import { Inter } from 'next/font/google'
import { EdgeStoreProvider } from './lib/edgestore'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SYMFARMIA',
  description: 'Generated by Ar2Design',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{backgroundColor: "#F9FAFB"}}>
        <EdgeStoreProvider>
          {children}
        </EdgeStoreProvider>
      </body>
    </html>
  )
}
