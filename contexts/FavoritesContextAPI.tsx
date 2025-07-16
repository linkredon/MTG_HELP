"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { MTGCard } from '@/types/mtg'
import { favoriteService } from '@/utils/apiService'
import * as AmplifyAuth from '@aws-amplify/auth'

interface FavoritesContextType {
  favorites: MTGCard[]
  addFavorite: (card: MTGCard) => Promise<void>
  removeFavorite: (cardId: string) => Promise<void>
  isFavorite: (cardId: string) => boolean
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [favorites, setFavorites] = useState<MTGCard[]>([])
  const [loading, setLoading] = useState(true)
  
  // Verificar status de autenticação com Amplify
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        await AmplifyAuth.getCurrentUser()
        setIsAuthenticated(true)
      } catch (error) {
        setIsAuthenticated(false)
      }
    }
    
    checkAuthStatus()
  }, [])

  // Carregar favoritos da API ou localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true)
      try {
        if (isAuthenticated) {
          // Carregar da API
          const response = await favoriteService.getAll()
          if (response.success && response.data) {
            setFavorites(response.data.map((fav: any) => fav.card))
          }
        } else {
          // Carregar do localStorage
          const savedFavorites = localStorage.getItem('mtg-favorites')
          if (savedFavorites) {
            try {
              setFavorites(JSON.parse(savedFavorites))
            } catch (error) {
              console.error('Erro ao carregar favoritos:', error)
              localStorage.removeItem('mtg-favorites')
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [isAuthenticated])

  // Salvar favoritos no localStorage quando não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('mtg-favorites', JSON.stringify(favorites))
    }
  }, [favorites, isAuthenticated])

  const addFavorite = async (card: MTGCard) => {
    try {
      if (isAuthenticated) {
        // Adicionar via API
        const response = await favoriteService.add(card)
        if (response.success) {
          setFavorites(prev => [...prev, card])
        }
      } else {
        // Adicionar no localStorage
        setFavorites(prev => {
          if (prev.some(c => c.id === card.id)) return prev
          return [...prev, card]
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error)
      throw error
    }
  }

  const removeFavorite = async (cardId: string) => {
    try {
      if (isAuthenticated) {
        // Remover via API
        const response = await favoriteService.removeCard(cardId)
        if (response.success) {
          setFavorites(prev => prev.filter(card => card.id !== cardId))
        }
      } else {
        // Remover do localStorage
        setFavorites(prev => prev.filter(card => card.id !== cardId))
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      throw error
    }
  }

  const isFavorite = (cardId: string) => {
    return favorites.some(card => card.id === cardId)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}