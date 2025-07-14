"use client"

import React from 'react'
import { TempAuthProvider } from '@/lib/temp-auth-provider'
import { AppProvider } from '@/contexts/AppContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import CardModalWrapper from '@/components/CardModalWrapper'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TempAuthProvider>
      <AppProvider>
        <FavoritesProvider>
          <CardModalWrapper>
            {children}
          </CardModalWrapper>
        </FavoritesProvider>
      </AppProvider>
    </TempAuthProvider>
  )
}
