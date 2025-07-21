"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { FileText, Printer } from "lucide-react"
import type { MTGCard } from '@/types/mtg'

// Importação dinâmica para evitar problemas de SSR
import dynamic from 'next/dynamic'

// Componente que será carregado apenas no cliente
const PdfGenerator = dynamic(() => import('./PdfGenerator'), { ssr: false })

interface CardPdfGeneratorProps {
  isOpen: boolean
  onClose: () => void
  missingCards: { card: MTGCard, have: number, need: number }[]
}

export default function CardPdfGenerator({ isOpen, onClose, missingCards }: CardPdfGeneratorProps) {
  const [copiesPerCard, setCopiesPerCard] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  // Função para gerar o PDF com as cartas faltantes
  const generatePdf = async () => {
    if (missingCards.length === 0) return
    
    setIsGenerating(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="quantum-card-dense fixed-modal max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Gerar PDF de Proxies
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-3 rounded-md border border-cyan-800/20">
            <p className="text-sm text-gray-300 mb-2">
              Gere um PDF com as cartas que faltam para sua coleção, organizadas em uma grade 3x3 com marcas de corte.
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
              <li>Marcas de corte incluídas para facilitar o recorte</li>
              <li>Versão de teste: apenas 1 página será gerada</li>
            </ul>
          </div>
        </div>
        
        {isGenerating && (
          <PdfGenerator 
            missingCards={missingCards}
            copiesPerCard={copiesPerCard}
            onComplete={() => setIsGenerating(false)}
          />
        )}
        
        <DialogFooter className="mt-4 pt-2 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={generatePdf}
            disabled={isGenerating || missingCards.length === 0}
            className="bg-cyan-800 hover:bg-cyan-700 text-white"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <span className="animate-spin mr-1">⟳</span> Gerando...
              </span>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-1" />
                Gerar PDF (Teste)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}