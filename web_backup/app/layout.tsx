import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import '../styles/card-collection.css'
import '../styles/deck-viewer-compact.css'
import '../styles/compact-layout.css'
import '../styles/quantum-compact-theme.css'
import '../styles/add-card-enhancements.css'
import '../styles/card-search-enhanced.css'
import '../styles/dropdown-menu.css'
import '../styles/dropdown-fixes.css'
import '../styles/select-dropdown-fix.css'
import '../styles/custom-dropdown.css'
import '../styles/dialog-fixes.css'
import '../styles/dropdown-overflow-fix.css'
import '../styles/dropdown-z-fix.css'
import '../styles/button-fix.css'
import '../styles/filter-fix.css'
import '../styles/cyan-theme.css'
import '../styles/header-compact.css'
import '../styles/nav-compact.css'
import '../styles/tab-buttons.css'
import '../styles/responsive-tabs.css'
import '../styles/tab-spacing.css'
import ClientLayout from './layout.client'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'MTG Helper - Gerenciador de Cartas Magic',
  description: 'Gerencie sua coleção de cartas Magic: The Gathering',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${orbitron.variable} quantum-compact compact-app`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}