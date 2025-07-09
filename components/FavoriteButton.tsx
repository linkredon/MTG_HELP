"use client"

import { Heart } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'
import type { MTGCard } from '@/types/mtg'
import { useState } from 'react'

interface FavoriteButtonProps {
  card: MTGCard
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const FavoriteButton = ({ card, size = 'md', className = '' }: FavoriteButtonProps) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const [isHovered, setIsHovered] = useState(false)
  
  const isFav = isFavorite(card.id)
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (isFav) {
      removeFavorite(card.id)
    } else {
      addFavorite(card)
    }
  }
  
  // Tamanhos do botão
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }
  
  // Tamanhos do ícone
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  return (
    <button
      onClick={handleToggleFavorite}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${sizeClasses[size]} bg-black/60 rounded-full flex items-center justify-center transition-all ${className}`}
      title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart 
        className={`${iconSizes[size]} ${isFav ? 'text-red-500 fill-current' : 'text-white'} ${isHovered && !isFav ? 'text-red-400' : ''}`} 
      />
      
      {/* Efeito de pulso quando favorito */}
      {isFav && (
        <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping-slow"></span>
      )}
    </button>
  )
}

export default FavoriteButton