"use client"

import { useRef, useEffect, useState } from 'react'
import type { MTGCard } from '@/types/mtg'

interface PrintableCardsProps {
  cards: MTGCard[]
  onPrintComplete: () => void
}

export default function PrintableCards({ cards, onPrintComplete }: PrintableCardsProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [imagesLoaded, setImagesLoaded] = useState(0)
  const totalImages = Math.min(cards.length, 9)
  
  useEffect(() => {
    // Função para imprimir as cartas
    const printCards = async () => {
      // Aguardar o carregamento das imagens
      if (imagesLoaded < totalImages) return
      
      // Aguardar um pouco mais para garantir que as imagens estejam renderizadas
      setTimeout(() => {
        // Imprimir usando a API do navegador
        window.print()
        
        // Notificar que a impressão foi concluída
        setTimeout(onPrintComplete, 500)
      }, 1000)
    }
    
    if (imagesLoaded === totalImages && totalImages > 0) {
      printCards()
    }
  }, [imagesLoaded, totalImages, onPrintComplete])
  
  // Função para marcar uma imagem como carregada
  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1)
  }
  
  return (
    <div ref={printRef} className="print-container">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
          }
          .card-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 2mm;
            padding: 10mm;
            width: 100%;
            height: 100%;
          }
          .card-item {
            width: 63mm;
            height: 88mm;
            position: relative;
            border: 0.1mm solid #ccc;
          }
          .card-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
      `}</style>
      
      <div className="card-grid">
        {cards.slice(0, 9).map((card, index) => {
          const imgUrl = card.image_uris?.normal || card.image_uris?.large || card.image_uris?.png || '';
          return (
            <div key={index} className="card-item">
              {/* Usar crossOrigin para evitar problemas de CORS */}
              <img 
                src={imgUrl} 
                alt={card.name}
                className="card-image"
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
                onError={() => {
                  console.error(`Erro ao carregar imagem: ${imgUrl}`);
                  handleImageLoad(); // Contar mesmo se houver erro
                }}
              />
            </div>
          );
        })}
      </div>
      
      <div className="loading-status" style={{ display: 'none' }}>
        Carregando imagens: {imagesLoaded}/{totalImages}
      </div>
    </div>
  )
}