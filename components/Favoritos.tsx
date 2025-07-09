"use client"

import { useState } from 'react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Heart, Search, Filter, Grid, List, LayoutList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const Favoritos = () => {
  const { favorites, removeFavorite } = useFavorites()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'details'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'cmc' | 'color' | 'date'>('name')

  // Filtrar favoritos com base na pesquisa
  const filteredFavorites = favorites.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.type_line?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Ordenar favoritos
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'cmc':
        return a.cmc - b.cmc
      case 'color':
        return (a.color_identity?.join('') || '').localeCompare(b.color_identity?.join('') || '')
      case 'date':
        return new Date(b.released_at).getTime() - new Date(a.released_at).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="p-4">
      {/* Header */}
      <div className="quantum-card-dense p-4 mb-4 card-red">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Cartas Favoritas</h2>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Gerencie suas cartas favoritas de Magic: The Gathering
        </p>
      </div>

      {/* Barra de ferramentas */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Pesquisar favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white"
          >
            <option value="name">Nome</option>
            <option value="cmc">Custo de Mana</option>
            <option value="color">Cor</option>
            <option value="date">Data de Lançamento</option>
          </select>
          
          <div className="flex rounded-md overflow-hidden border border-gray-700">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`rounded-none ${viewMode === 'grid' ? 'bg-indigo-600' : 'bg-gray-800'}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={`rounded-none ${viewMode === 'list' ? 'bg-indigo-600' : 'bg-gray-800'}`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'details' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('details')}
              className={`rounded-none ${viewMode === 'details' ? 'bg-indigo-600' : 'bg-gray-800'}`}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {favorites.length === 0 ? (
        <div className="quantum-card-dense p-8 text-center">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma carta favorita</h3>
          <p className="text-sm text-gray-400 mb-4">
            Você ainda não adicionou nenhuma carta aos seus favoritos.
          </p>
          <p className="text-sm text-gray-400">
            Adicione cartas aos favoritos clicando no ícone de coração nas páginas de pesquisa, coleção ou construtor de decks.
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-400 mb-4">
            {filteredFavorites.length} {filteredFavorites.length === 1 ? 'carta encontrada' : 'cartas encontradas'}
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedFavorites.map(card => (
                <div key={card.id} className="relative group">
                  <div className="aspect-[745/1040] rounded-lg overflow-hidden">
                    <img 
                      src={card.image_uris?.normal || card.card_faces?.[0].image_uris?.normal} 
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFavorite(card.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-red-400 hover:bg-black/80 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-2 w-full">
                      <div className="text-sm font-medium text-white truncate">{card.name}</div>
                      <div className="text-xs text-gray-300 truncate">{card.type_line}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {sortedFavorites.map(card => (
                <div key={card.id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={card.image_uris?.art_crop || card.card_faces?.[0].image_uris?.art_crop} 
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium text-white">{card.name}</div>
                    <div className="text-xs text-gray-400 truncate">{card.type_line}</div>
                  </div>
                  <div className="text-xs text-gray-400">{card.set_name}</div>
                  <button
                    onClick={() => removeFavorite(card.id)}
                    className="w-8 h-8 bg-gray-700/60 rounded-full flex items-center justify-center text-red-400 hover:bg-gray-700/80 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Details View */}
          {viewMode === 'details' && (
            <div className="space-y-3">
              {sortedFavorites.map(card => (
                <div key={card.id} className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={card.image_uris?.art_crop || card.card_faces?.[0].image_uris?.art_crop} 
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-medium text-white">{card.name}</div>
                      <div className="text-xs text-gray-400">{card.type_line}</div>
                    </div>
                    <button
                      onClick={() => removeFavorite(card.id)}
                      className="w-8 h-8 bg-gray-700/60 rounded-full flex items-center justify-center text-red-400 hover:bg-gray-700/80 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-300 mt-2">
                    {card.oracle_text?.split('\n').map((text, i) => (
                      <p key={i} className="mb-1">{text}</p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                    <div>{card.set_name} ({card.set_code.toUpperCase()})</div>
                    <div>{card.rarity}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Favoritos