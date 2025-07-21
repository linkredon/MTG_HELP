"use client"

// Removido import do SessionProvider NextAuth
import { ReactNode } from 'react'
import { AppProvider } from '@/contexts/AppContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import CardModalWrapper from '@/components/CardModalWrapper'

interface HomeContentWrapperProps {
  children: ReactNode
}

export default function HomeContentWrapper({ children }: HomeContentWrapperProps) {
  return (
      <AppProvider>
        <FavoritesProvider>
          <CardModalWrapper>
            {children}
          </CardModalWrapper>
        </FavoritesProvider>
      </AppProvider>
  )
}
