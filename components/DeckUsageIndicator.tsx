"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAppContext } from "@/contexts/AppContext"
import { Target, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MTGCard } from '@/types/mtg'

interface DeckUsageIndicatorProps {
  card: MTGCard
  showDetails?: boolean
  className?: string
  compact?: boolean
}

export default function DeckUsageIndicator({ 
  card, 
  showDetails = false, 
  className = "",
  compact = false 
}: DeckUsageIndicatorProps) {
  const { getCartasUsadasEmDecks } = useAppContext()
  const usages = getCartasUsadasEmDecks(card.id)

  if (usages.length === 0) {
    return compact ? null : (
      <div className={`text-xs text-gray-500 ${className}`}>
        Não está em nenhum deck
      </div>
    )
  }

  const totalInDecks = usages.reduce((sum, usage) => sum + usage.quantity, 0)

  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={`text-xs bg-blue-900/20 border-blue-600 text-blue-400 ${className}`}
      >
        <Target className="w-3 h-3 mr-1" />
        {totalInDecks} em {usages.length} deck{usages.length > 1 ? 's' : ''}
      </Badge>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-gray-300">
          Usada em {usages.length} deck{usages.length > 1 ? 's' : ''}
        </span>
        <Badge variant="secondary" className="bg-blue-900/20 text-blue-400">
          {totalInDecks} total
        </Badge>
      </div>

      {showDetails && (
        <div className="space-y-1">
          {usages.map((usage, index) => (
            <Card key={`${usage.deck.id}-${usage.category}-${index}`} className="bg-gray-800/30 border-gray-700/50">
              <CardContent className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">
                      {usage.deck.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {usage.deck.format}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        usage.category === 'commander' 
                          ? 'bg-yellow-900/20 text-yellow-400' 
                          : usage.category === 'sideboard'
                          ? 'bg-purple-900/20 text-purple-400'
                          : 'bg-green-900/20 text-green-400'
                      }`}
                    >
                      {usage.category === 'mainboard' ? 'Principal' : 
                       usage.category === 'sideboard' ? 'Sideboard' : 'Commander'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {usage.quantity}x
                    </Badge>
                  </div>
                </div>
                
                {usage.deck.description && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {usage.deck.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
