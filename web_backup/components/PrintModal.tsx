"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Printer, ExternalLink } from "lucide-react"
import "@/styles/mtg-print.css"
import "@/styles/print-modal.css"
import type { MTGCard } from '@/types/mtg'

interface PrintModalProps {
  isOpen: boolean
  onClose: () => void
  missingCards: { card: MTGCard, have: number, need: number }[]
}

export default function PrintModal({ isOpen, onClose, missingCards }: PrintModalProps) {
  const [copiesPerCard, setCopiesPerCard] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [loadedImages, setLoadedImages] = useState(0)

  // Preparar as cartas para impressão
  const prepareCardsForPrint = () => {
    const cardsForPrint: MTGCard[] = []
    
    // Adicionar cada carta o número de vezes necessário
    for (const item of missingCards) {
      const missingCount = Math.min(item.need - item.have, copiesPerCard)
      for (let i = 0; i < missingCount; i++) {
        cardsForPrint.push(item.card)
        if (cardsForPrint.length >= 9) break // Limitar a 9 cartas para teste
      }
      if (cardsForPrint.length >= 9) break // Limitar a 9 cartas para teste
    }
    
    return cardsForPrint
  }

  // Função para imprimir a página
  const handlePrint = () => {
    window.print()
  }
  
  // Função para abrir no mtgprint.net
  const openInMtgPrint = () => {
    // Criar uma lista de IDs de cartas Scryfall
    const cardIds = prepareCardsForPrint().map(card => card.id).join('|')
    const url = `https://mtgprint.net/?ids=${cardIds}`
    window.open(url, '_blank')
  }
  
  // Função para marcar uma imagem como carregada
  const handleImageLoad = () => {
    setLoadedImages(prev => prev + 1)
  }

  // Iniciar a visualização prévia
  const startPreview = () => {
    setShowPreview(true)
    setLoadedImages(0)
  }

  // Fechar a visualização prévia
  const closePreview = () => {
    setShowPreview(false)
  }

  const cards = prepareCardsForPrint()
  const totalImages = Math.min(cards.length, 9)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`quantum-card-dense fixed-modal print-modal-content ${showPreview ? 'max-w-3xl' : 'max-w-md'}`}>
        <DialogHeader className="print-modal-header">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            {showPreview ? 'Visualização de Impressão' : 'Imprimir Proxies'}
          </DialogTitle>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-3 rounded-md border border-cyan-800/20">
              <p className="text-sm text-gray-300 mb-2">
                Imprima as cartas que faltam para sua coleção, organizadas em uma grade 3x3.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Cópias por carta:</span>
                <Input
                  type="number"
                  min="1"
                  max="4"
                  value={copiesPerCard}
                  onChange={(e) => setCopiesPerCard(parseInt(e.target.value) || 1)}
                  className="quantum-field-sm w-16"
                />
              </div>
            </div>
            
            <div className="bg-cyan-900/20 p-3 rounded-md border border-cyan-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-white">Informações de Impressão</h3>
              </div>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-5">
                <li>Tamanho das cartas: 63mm x 88mm (tamanho real)</li>
                <li>9 cartas por página em formato A4</li>
                <li>Versão de teste: apenas 1 página será impressa</li>
                <li>Opção para abrir no MTGPrint.net para mais opções</li>
              </ul>
            </div>
            
            <DialogFooter className="mt-4 pt-2 border-t border-gray-700">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button 
                onClick={startPreview}
                disabled={missingCards.length === 0}
                className="bg-cyan-800 hover:bg-cyan-700 text-white"
              >
                <Printer className="w-4 h-4 mr-1" />
                Visualizar Impressão
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="mtg-print-preview print-modal-preview">
            <div className="print-sheet-container">
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
                        onError={handleImageLoad}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
            
            {loadedImages < totalImages && (
              <div className="loading-indicator">
                Carregando imagens... ({loadedImages}/{totalImages})
              </div>
            )}
            
            <div className="print-controls print-modal-footer">
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
                onClick={closePreview}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}