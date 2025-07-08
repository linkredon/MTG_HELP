"use client"

import { useState, useRef } from 'react'
import { Button } from "./ui/button"
import { Upload, FileText, AlertCircle } from "lucide-react"
import type { SpoilerCard } from '@/types/mtg'

interface BatchUploaderProps {
  onCardsUploaded: (cards: Partial<SpoilerCard>[]) => void
}

export default function BatchUploader({ onCardsUploaded }: BatchUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para processar o arquivo JSON
  const processJsonFile = (file: File) => {
    setIsProcessing(true)
    setError(null)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const content = e.target.result as string
          const cards = JSON.parse(content)
          
          if (!Array.isArray(cards)) {
            throw new Error('O arquivo deve conter um array de cartas.')
          }
          
          // Validar cada carta
          const validCards = cards.filter(card => {
            return card && typeof card === 'object' && (card.name || card.image_uris?.normal)
          })
          
          if (validCards.length === 0) {
            throw new Error('Nenhuma carta válida encontrada no arquivo.')
          }
          
          onCardsUploaded(validCards)
        }
      } catch (err) {
        console.error('Erro ao processar arquivo JSON:', err)
        setError(err instanceof Error ? err.message : 'Erro ao processar o arquivo.')
      } finally {
        setIsProcessing(false)
      }
    }
    reader.onerror = () => {
      setError('Erro ao ler o arquivo.')
      setIsProcessing(false)
    }
    reader.readAsText(file)
  }

  // Função para lidar com a seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processJsonFile(e.target.files[0])
    }
  }

  // Funções para lidar com o drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processJsonFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <FileText className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-300">
            Arraste e solte um arquivo JSON aqui, ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500">
            O arquivo deve conter um array de objetos com as propriedades das cartas
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        <Upload className="w-4 h-4 mr-1" />
        {isProcessing ? 'Processando...' : 'Selecionar Arquivo JSON'}
      </Button>
    </div>
  )
}