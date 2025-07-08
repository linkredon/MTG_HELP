"use client"

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Printer } from "lucide-react"
import "@/styles/print-styles.css"
import type { MTGCard } from '@/types/mtg'

interface CardPrintPreviewProps {
  cards: MTGCard[]
  onClose: () => void
}

export default function CardPrintPreview({ cards, onClose }: CardPrintPreviewProps) {
  const [loadedImages, setLoadedImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Pré-carregar as imagens
    const preloadImages = async () => {
      setIsLoading(true)
      
      const loadedUrls: string[] = []
      
      for (const card of cards.slice(0, 9)) {
        const imgUrl = card.image_uris?.normal || card.image_uris?.large || card.image_uris?.png
        
        if (imgUrl) {
          try {
            // Criar uma nova imagem e aguardar seu carregamento
            await new Promise<void>((resolve, reject) => {
              const img = new window.Image()
              img.onload = () => {
                loadedUrls.push(imgUrl)
                resolve()
              }
              img.onerror = () => {
                console.error(`Erro ao carregar imagem: ${imgUrl}`)
                resolve() // Continuar mesmo com erro
              }
              img.crossOrigin = "anonymous"
              img.src = imgUrl
            })
          } catch (error) {
            console.error(`Erro ao carregar imagem: ${imgUrl}`, error)
          }
        }
      }
      
      setLoadedImages(loadedUrls)
      setIsLoading(false)
    }
    
    preloadImages()
  }, [cards])
  
  // Função para imprimir a página
  const handlePrint = () => {
    window.print()
  }
  
  return (
    <div className="card-print-preview">
      <div className="print-area">
        <div className="card-grid cut-marks">
          {cards.slice(0, 9).map((card, index) => {
            const imgUrl = card.image_uris?.normal || card.image_uris?.large || card.image_uris?.png || '';
            return (
              <div key={index} className="card-item">
                <img 
                  src={imgUrl} 
                  alt={card.name}
                  className="card-image"
                  crossOrigin="anonymous"
                />
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="print-controls">
        <Button 
          onClick={handlePrint}
          disabled={isLoading}
          className="bg-cyan-800 hover:bg-cyan-700 text-white"
        >
          <Printer className="w-4 h-4 mr-2" />
          {isLoading ? 'Carregando imagens...' : 'Imprimir'}
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