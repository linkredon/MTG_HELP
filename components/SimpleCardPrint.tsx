"use client"

import { useState } from 'react'
import { Button } from "./ui/button"
import { Printer, ExternalLink } from "lucide-react"
import "@/styles/mtg-print.css"
import type { MTGCard } from '@/types/mtg'

interface SimpleCardPrintProps {
  cards: MTGCard[]
  onClose: () => void
}

export default function SimpleCardPrint({ cards, onClose }: SimpleCardPrintProps) {
  const [loadedImages, setLoadedImages] = useState(0)
  const totalImages = Math.min(cards.length, 9)
  
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
    setLoadedImages(prev => prev + 1)
  }
  
  return (
    <div className="mtg-print-preview">
      <div className="print-sheet">
        <div className="print-grid cut-lines">
          {cards.slice(0, 9).map((card, index) => {
            const imgUrl = card.image_uris?.normal || card.image_uris?.large || card.image_uris?.png || '';
            return (
              <div key={index} className="print-card">
                <img 
                  src={imgUrl} 
                  alt={card.name}
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {loadedImages < totalImages && (
        <div className="loading-indicator">
          Carregando imagens... ({loadedImages}/{totalImages})
        </div>
      )}
      
      <div className="print-controls">
        <Button 
          onClick={handlePrint}
          disabled={loadedImages < totalImages}
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