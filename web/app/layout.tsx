import type { Metadata } from 'next'
import { AuthProvider } from './context/auth.context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Esperanza — Job Tracker',
  description: 'Suivi de recherche d\'emploi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}