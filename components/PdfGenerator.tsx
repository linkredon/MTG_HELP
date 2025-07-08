"use client"

import { jsPDF } from 'jspdf'
import type { MTGCard } from '@/types/mtg'

interface PdfGeneratorProps {
  missingCards: { card: MTGCard, have: number, need: number }[]
  copiesPerCard: number
  onComplete: () => void
}

const PdfGenerator = ({ missingCards, copiesPerCard, onComplete }: PdfGeneratorProps) => {
  const generatePdf = async () => {
    try {
      // Criar um novo documento PDF no tamanho A4
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })
      
      // Dimensões de uma carta de Magic (63mm x 88mm)
      const cardWidth = 63
      const cardHeight = 88
      
      // Margens da página
      const margin = 10
      
      // Espaçamento entre cartas
      const spacing = 2
      
      // Calcular quantas cartas cabem por linha e por coluna
      const cardsPerRow = 3
      const cardsPerColumn = 3
      
      // Calcular o tamanho disponível para cada carta
      const availableWidth = (210 - (margin * 2) - (spacing * (cardsPerRow - 1))) / cardsPerRow
      const availableHeight = (297 - (margin * 2) - (spacing * (cardsPerColumn - 1))) / cardsPerColumn
      
      // Escala para ajustar as cartas ao tamanho disponível
      const scaleX = availableWidth / cardWidth
      const scaleY = availableHeight / cardHeight
      const scale = Math.min(scaleX, scaleY)
      
      // Dimensões finais da carta no PDF
      const finalCardWidth = cardWidth * scale
      const finalCardHeight = cardHeight * scale
      
      // Preparar as cartas para o PDF (apenas as primeiras 9 para teste)
      const cardsForPdf = []
      
      // Adicionar cada carta o número de vezes necessário
      for (const item of missingCards.slice(0, 9)) {
        const missingCount = Math.min(item.need - item.have, copiesPerCard)
        for (let i = 0; i < missingCount; i++) {
          cardsForPdf.push(item.card)
          if (cardsForPdf.length >= 9) break // Limitar a 9 cartas para teste
        }
        if (cardsForPdf.length >= 9) break // Limitar a 9 cartas para teste
      }
      
      // Adicionar as cartas ao PDF
      for (let i = 0; i < Math.min(cardsForPdf.length, 9); i++) {
        const card = cardsForPdf[i]
        
        // Calcular a posição da carta na página
        const row = Math.floor(i / cardsPerRow)
        const col = i % cardsPerRow
        
        const x = margin + col * (finalCardWidth + spacing)
        const y = margin + row * (finalCardHeight + spacing)
        
        // Carregar a imagem da carta
        const imgUrl = card.image_uris?.normal || card.image_uris?.large || card.image_uris?.png
        
        if (imgUrl) {
          // Converter a URL da imagem para base64
          const response = await fetch(imgUrl)
          const blob = await response.blob()
          const reader = new FileReader()
          
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              // Adicionar a imagem ao PDF
              const imgData = reader.result as string
              doc.addImage(imgData, 'JPEG', x, y, finalCardWidth, finalCardHeight)
              
              // Adicionar linhas de corte
              doc.setDrawColor(200, 200, 200)
              doc.setLineWidth(0.1)
              
              // Linhas horizontais
              if (row > 0) {
                doc.line(x - spacing/2, y, x + finalCardWidth + spacing/2, y)
              }
              if (row < cardsPerColumn - 1) {
                doc.line(x - spacing/2, y + finalCardHeight, x + finalCardWidth + spacing/2, y + finalCardHeight)
              }
              
              // Linhas verticais
              if (col > 0) {
                doc.line(x, y - spacing/2, x, y + finalCardHeight + spacing/2)
              }
              if (col < cardsPerRow - 1) {
                doc.line(x + finalCardWidth, y - spacing/2, x + finalCardWidth, y + finalCardHeight + spacing/2)
              }
              
              resolve()
            }
            reader.readAsDataURL(blob)
          })
        }
      }
      
      // Salvar o PDF
      doc.save('mtg_proxies.pdf')
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
    } finally {
      onComplete()
    }
  }

  // Iniciar a geração do PDF automaticamente
  generatePdf()
  
  return null
}

export default PdfGenerator