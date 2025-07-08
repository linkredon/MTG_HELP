"use client"

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Upload, AlertCircle, Check, Info } from "lucide-react"
import { useAppContext } from "@/contexts/AppContext"
import type { MTGCard } from '@/types/mtg'

interface ImportCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (importedCount: number) => void
}

export default function ImportCollectionModal({ isOpen, onClose, onSuccess }: ImportCollectionModalProps) {
  const { currentCollection, adicionarCarta } = useAppContext()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState({ processed: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        setError("Por favor, selecione um arquivo CSV válido")
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setError(null)
    }
  }

  const processCSV = async (text: string) => {
    // Dividir o texto em linhas (corrigindo o regex para quebras de linha)
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error("Arquivo CSV inválido ou vazio")
    }
    
    // Verificar o cabeçalho (formato Manabox)
    const header = lines[0].split(',')
    
    // Verificar se é um formato válido (case insensitive)
    const headerLower = header.map(h => h.toLowerCase())
    if (!headerLower.includes('name') && !headerLower.includes('nome') && !headerLower.includes('card name')) {
      throw new Error("Formato de CSV não reconhecido. O arquivo deve incluir uma coluna para o nome da carta (Name, Nome, Card Name)")
    }
    
    // Encontrar índices das colunas importantes (case insensitive)
    const nameIndex = headerLower.findIndex(col => 
      col === 'name' || col === 'nome' || col === 'card name')
    const quantityIndex = headerLower.findIndex(col => 
      col === 'quantity' || col === 'quantidade' || col === 'count' || col === 'amount' || col === 'qtd')
    const setIndex = headerLower.findIndex(col => 
      col === 'set' || col === 'conjunto' || col === 'edition' || col === 'edição' || col === 'set code')
    
    if (nameIndex === -1) {
      throw new Error("Coluna de nome não encontrada no CSV")
    }
    
    // Processar cada linha
    const total = lines.length - 1 // Excluindo o cabeçalho
    let processed = 0
    let importedCount = 0
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      
      const values = line.split(',')
      
      // Obter nome e quantidade
      const cardName = values[nameIndex]?.trim()
      const quantity = quantityIndex !== -1 ? parseInt(values[quantityIndex]) || 1 : 1
      const setName = setIndex !== -1 ? values[setIndex]?.trim() : undefined
      
      if (cardName) {
        try {
          // Buscar carta na API Scryfall
          const query = setName ? `!"${cardName}" set:${setName}` : `!"${cardName}"`
          const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.data && data.data.length > 0) {
              // Adicionar carta à coleção
              const card = data.data[0] as MTGCard
              
              // Adicionar a carta à coleção a quantidade especificada
              for (let j = 0; j < quantity; j++) {
                await adicionarCarta(card)
                importedCount++
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao processar carta: ${cardName}`, error)
        }
      }
      
      processed++
      setProgress({ processed, total })
    }
    
    return importedCount
  }

  const handleImport = async () => {
    if (!file || !currentCollection) return
    
    setIsProcessing(true)
    setError(null)
    setProgress({ processed: 0, total: 0 })
    
    try {
      const text = await file.text()
      console.log("Conteúdo do CSV:", text.substring(0, 200)) // Log para debug
      
      if (!text.trim()) {
        throw new Error("O arquivo CSV está vazio")
      }
      
      const importedCount = await processCSV(text)
      onSuccess(importedCount)
      onClose()
    } catch (error) {
      console.error("Erro ao importar coleção:", error)
      setError(error instanceof Error ? error.message : "Erro ao processar o arquivo")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="quantum-card-dense fixed-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            Importar Coleção (CSV)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-3 rounded-md border border-cyan-500/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-300">
                <p className="mb-1">Importe sua coleção a partir de um arquivo CSV no formato Manabox:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>O arquivo deve conter colunas para Nome, Quantidade e Conjunto (opcional)</li>
                  <li>Formatos aceitos: Manabox, MTG Studio, Deckbox</li>
                  <li>Exemplo: <code className="bg-gray-700/50 px-1 rounded">Name,Set,Quantity</code></li>
                </ul>
                <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                  <p className="font-medium text-cyan-400 mb-1">Exemplo de conteúdo:</p>
                  <code>Name,Set,Quantity<br/>Lightning Bolt,M10,4<br/>Counterspell,7ED,2</code>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs text-cyan-400 font-medium">Selecione o arquivo CSV</label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
            {file && (
              <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800/50 p-2 rounded">
                <Check className="w-3 h-3 text-green-400" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded p-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-cyan-400"
                  style={{ width: `${progress.total ? (progress.processed / progress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Processando {progress.processed} de {progress.total} cartas...
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!file || isProcessing}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}