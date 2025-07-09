"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Search, Trash2, ExternalLink, Info } from 'lucide-react'
import { useCardModal } from '@/contexts/CardModalContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import Image from 'next/image'
import { getImageUrl } from '@/utils/imageService'
import { Badge } from '@/components/ui/badge'
import { useAppContext } from '@/contexts/AppContext'

export default function FavoritosCompact() {
  const { favorites, removeFavorite } = useFavorites()
  const { openModal } = useCardModal()
  const { getQuantidadeNaColecao } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filtrar favoritos com base no termo de busca
  const filteredFavorites = favorites.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.printed_name && card.printed_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="quantum-card-dense p-4 card-red">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Cartas Favoritas</h2>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Acesse rapidamente suas cartas favoritas
        </p>
      </div>
      
      {/* Barra de pesquisa */}
      <div className="quantum-card-dense p-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar nos favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="quantum-field pl-9"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {/* Lista de favoritos */}
      <div className="quantum-card-dense p-3">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhum favorito encontrado</h3>
            <p className="text-gray-400 text-sm mb-4">
              {searchTerm ? 
                'Nenhuma carta corresponde à sua busca.' : 
                'Adicione cartas aos favoritos clicando no ícone de coração nas cartas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredFavorites.map((card) => (
              <div key={card.id} className="relative group">
                <Card className="overflow-hidden border-0 rounded-lg shadow-md transition-all hover:shadow-lg bg-gray-800/50 hover:bg-gray-800/80">
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => openModal(card)}
                  >
                    <div className="aspect-[745/1040] overflow-hidden">
                      <Image
                        src={getImageUrl(card)}
                        alt={card.name}
                        width={223}
                        height={310}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay com informações */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <h3 className="text-sm font-medium text-white truncate">{card.name}</h3>
                      <p className="text-xs text-gray-300 truncate">{card.type_line}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge className="bg-blue-600/80 text-[10px] py-0 px-1.5 h-4">
                          {card.set_name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-2 bg-gray-800/80">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Info className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-gray-300">
                          {getQuantidadeNaColecao(card.id) > 0 ? (
                            <span className="text-green-400">{getQuantidadeNaColecao(card.id)}x na coleção</span>
                          ) : (
                            <span className="text-gray-500">Não na coleção</span>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                          onClick={() => window.open(`https://scryfall.com/card/${card.set}/${card.collector_number}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                          onClick={() => removeFavorite(card.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}