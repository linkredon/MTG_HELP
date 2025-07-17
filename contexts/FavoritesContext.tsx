"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { MTGCard } from '@/types/mtg'
import { favoriteService } from '@/utils/apiService'
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext'

interface FavoritesContextType {
  favorites: MTGCard[]
  addFavorite: (card: MTGCard) => Promise<void>
  removeFavorite: (cardId: string) => Promise<void>
  isFavorite: (cardId: string) => boolean
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAmplifyAuth()
  const [favorites, setFavorites] = useState<MTGCard[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar favoritos da API ou localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      // Aguardar até que a autenticação seja determinada
      if (authLoading) {
        return
      }

      setLoading(true)
      try {
        if (isAuthenticated && authUser) {
          // Carregar da API
          try {
            const response = await favoriteService.getAll()
            if (response.success && response.data) {
              setFavorites(response.data.map((fav: any) => fav.card))
            } else {
              console.log('Resposta da API de favoritos:', response)
              // Se a API não retornou dados, usar localStorage como fallback
              const savedFavorites = localStorage.getItem('mtg-favorites')
              if (savedFavorites) {
                try {
                  setFavorites(JSON.parse(savedFavorites))
                } catch (error) {
                  console.error('Erro ao carregar favoritos do localStorage:', error)
                  localStorage.removeItem('mtg-favorites')
                }
              }
            }
          } catch (apiError) {
            console.warn('Erro ao carregar favoritos da API, usando localStorage:', apiError)
            // Fallback para localStorage
            const savedFavorites = localStorage.getItem('mtg-favorites')
            if (savedFavorites) {
              try {
                setFavorites(JSON.parse(savedFavorites))
              } catch (error) {
                console.error('Erro ao carregar favoritos do localStorage:', error)
                localStorage.removeItem('mtg-favorites')
              }
            }
          }
        } else {
          // Carregar do localStorage quando não autenticado
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
        // Em caso de erro, tentar carregar do localStorage
        try {
          const savedFavorites = localStorage.getItem('mtg-favorites')
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites))
          }
        } catch (localError) {
          console.error('Erro ao carregar favoritos do localStorage:', localError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [isAuthenticated, authUser, authLoading])

  // Salvar favoritos no localStorage quando não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      localStorage.setItem('mtg-favorites', JSON.stringify(favorites))
    }
  }, [favorites, isAuthenticated, authLoading])

  const addFavorite = async (card: MTGCard) => {
    try {
      if (isAuthenticated && !authLoading) {
        // Adicionar via API
        try {
          const response = await favoriteService.add(card)
          if (response.success) {
            setFavorites(prev => [...prev, card])
          } else {
            console.warn('Falha ao adicionar favorito via API, usando localStorage')
            // Fallback para localStorage
            setFavorites(prev => {
              if (prev.some(c => c.id === card.id)) return prev
              return [...prev, card]
            })
          }
        } catch (apiError) {
          console.warn('Erro ao adicionar favorito via API, usando localStorage:', apiError)
          // Fallback para localStorage
          setFavorites(prev => {
            if (prev.some(c => c.id === card.id)) return prev
            return [...prev, card]
          })
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
      // Em caso de erro, adicionar no localStorage como fallback
      setFavorites(prev => {
        if (prev.some(c => c.id === card.id)) return prev
        return [...prev, card]
      })
    }
  }

  const removeFavorite = async (cardId: string) => {
    try {
      if (isAuthenticated && !authLoading) {
        // Remover via API
        try {
          const response = await favoriteService.removeCard(cardId)
          if (response.success) {
            setFavorites(prev => prev.filter(card => card.id !== cardId))
          } else {
            console.warn('Falha ao remover favorito via API, usando localStorage')
            // Fallback para localStorage
            setFavorites(prev => prev.filter(card => card.id !== cardId))
          }
        } catch (apiError) {
          console.warn('Erro ao remover favorito via API, usando localStorage:', apiError)
          // Fallback para localStorage
          setFavorites(prev => prev.filter(card => card.id !== cardId))
        }
      } else {
        // Remover do localStorage
        setFavorites(prev => prev.filter(card => card.id !== cardId))
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      // Em caso de erro, remover do localStorage como fallback
      setFavorites(prev => prev.filter(card => card.id !== cardId))
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
