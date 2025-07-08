"use client"

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Printer, ExternalLink } from "lucide-react"
import "@/styles/mtg-print.css"
import type { MTGCard } from '@/types/mtg'

interface MtgPrintPreviewProps {
  cards: MTGCard[]
  onClose: () => void
}

export default function MtgPrintPreview({ cards, onClose }: MtgPrintPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)
  
  useEffect(() => {
    // Verificar quando todas as imagens estiverem carregadas
    if (loadedCount >= Math.min(cards.length, 9)) {
      setIsLoading(false)
    }
  }, [loadedCount, cards.length])
  
  // Função para imprimir a página
  const handlePrint = () => {
    window.print()
  }
  
  // Função para abrir no mtgprint.net
  const openInMtgPrint = () => {
    // Criar uma lista de IDs de cartas Scryfall
    const cardIds = cards.slice(0, 9).map(card => card.id).join('|')
    const url = `https://mtgprint.net/?ids=${cardIds}`
    window.open(url, '_blank')
  }
  
  // Função para marcar uma imagem como carregada
  const handleImageLoad = () => {
    setLoadedCount(prev => prev + 1)
  }
  
  // Função para lidar com erro de carregamento de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Erro ao carregar imagem:", e.currentTarget.src)
    // Tentar carregar uma versão alternativa da imagem
    if (e.currentTarget.src.includes('normal')) {
      e.currentTarget.src = e.currentTarget.src.replace('normal', 'small')
    } else if (e.currentTarget.src.includes('small')) {
      e.currentTarget.src = e.currentTarget.src.replace('small', 'art_crop')
    } else {
      // Se todas as tentativas falharem, usar uma URL de fallback
      e.currentTarget.src = "https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=0"
    }
    handleImageLoad() // Contar mesmo se houver erro
  }
  
  return (
    <div className="mtg-print-preview">
      <div className="print-sheet">
        <div className="print-grid cut-lines">
          {cards.slice(0, 9).map((card, index) => {
            // Usar apenas as propriedades que existem no tipo image_uris
            const imgUrl = card.image_uris?.normal || card.image_uris?.small || card.image_uris?.art_crop || '';
            return (
              <div key={index} className="print-card">
                <img 
                  src={imgUrl} 
                  alt={card.name}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {isLoading && (
        <div className="loading-indicator">
          Carregando imagens... ({loadedCount}/{Math.min(cards.length, 9)})
        </div>
      )}
      
      <div className="print-controls">
        <Button 
          onClick={handlePrint}
          disabled={isLoading}
          className="bg-cyan-800 hover:bg-cyan-700 text-white"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </Button>
        
        <Button 
          variant="outline"
          onClick={openInMtgPrint}
          className="border-cyan-800/50 text-cyan-400"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir no MTGPrint.net
        </Button>
        
        <Button 
          variant="outline"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
    </div>
  )
}