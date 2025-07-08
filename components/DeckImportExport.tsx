"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/contexts/AppContext"
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface DeckImportExportProps {
  className?: string
}

export default function DeckImportExport({ className = "" }: DeckImportExportProps) {
  const { importarDeckDeLista, decks } = useAppContext()
  const [importData, setImportData] = useState({
    name: '',
    format: 'Standard',
    colors: [] as string[],
    description: '',
    isPublic: false,
    tags: [] as string[]
  })
  const [deckList, setDeckList] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    cardsFound?: number
    cardsNotFound?: string[]
  } | null>(null)

  const formats = ['Standard', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Pioneer', 'Historic', 'Pauper']
  const colors = [
    { code: 'W', name: 'Branco' },
    { code: 'U', name: 'Azul' },
    { code: 'B', name: 'Preto' },
    { code: 'R', name: 'Vermelho' },
    { code: 'G', name: 'Verde' }
  ]

  const handleImport = async () => {
    if (!importData.name.trim() || !deckList.trim()) return

    setImporting(true)
    setImportResult(null)

    try {
      await importarDeckDeLista(deckList, importData)
      setImportResult({
        success: true,
        message: `Deck "${importData.name}" importado com sucesso!`,
      })
      
      // Limpar formulário
      setImportData({
        name: '',
        format: 'Standard',
        colors: [],
        description: '',
        isPublic: false,
        tags: []
      })
      setDeckList('')
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Erro ao importar deck. Verifique o formato da lista.'
      })
    } finally {
      setImporting(false)
    }
  }

  const exportDeck = (deckId: string, format: 'mtgo' | 'arena' | 'text' = 'text') => {
    const deck = decks.find(d => d.id === deckId)
    if (!deck) return

    let content = ''
    
    // Header
    content += `// ${deck.name}\n`
    content += `// Formato: ${deck.format}\n`
    if (deck.description) {
      content += `// ${deck.description}\n`
    }
    content += `\n`

    // Mainboard
    const mainboard = deck.cards.filter(c => c.category === 'mainboard')
    if (mainboard.length > 0) {
      content += `// Deck Principal (${mainboard.reduce((sum, c) => sum + c.quantity, 0)} cartas)\n`
      mainboard.forEach(card => {
        content += `${card.quantity} ${card.card.name}\n`
      })
      content += `\n`
    }

    // Sideboard
    const sideboard = deck.cards.filter(c => c.category === 'sideboard')
    if (sideboard.length > 0) {
      content += `// Sideboard (${sideboard.reduce((sum, c) => sum + c.quantity, 0)} cartas)\n`
      sideboard.forEach(card => {
        content += `${card.quantity} ${card.card.name}\n`
      })
      content += `\n`
    }

    // Commander
    const commander = deck.cards.filter(c => c.category === 'commander')
    if (commander.length > 0) {
      content += `// Commander\n`
      commander.forEach(card => {
        content += `${card.quantity} ${card.card.name}\n`
      })
    }

    // Download
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exampleList = `4 Lightning Bolt
4 Lava Spike
4 Rift Bolt
4 Monastery Swiftspear
4 Goblin Guide
20 Mountain
4 Chain Lightning

// Sideboard
3 Smash to Smithereens
4 Leyline of the Void`

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Importar Deck */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Lista de Deck
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Deck
              </label>
              <Input
                value={importData.name}
                onChange={(e) => setImportData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do deck..."
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Formato
              </label>
              <Select 
                value={importData.format} 
                onValueChange={(value) => setImportData(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cores do Deck
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <Button
                  key={color.code}
                  size="sm"
                  variant={importData.colors.includes(color.code) ? "default" : "outline"}
                  onClick={() => {
                    setImportData(prev => ({
                      ...prev,
                      colors: prev.colors.includes(color.code)
                        ? prev.colors.filter(c => c !== color.code)
                        : [...prev.colors, color.code]
                    }))
                  }}
                  className={`text-xs ${
                    importData.colors.includes(color.code)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {color.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lista de Cartas
            </label>
            <Textarea
              value={deckList}
              onChange={(e) => setDeckList(e.target.value)}
              placeholder={exampleList}
              rows={12}
              className="bg-gray-700/50 border-gray-600 text-white font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Formato: quantidade + nome da carta (ex: "4 Lightning Bolt"). Use "// Sideboard" para separar sideboard.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição (opcional)
            </label>
            <Textarea
              value={importData.description}
              onChange={(e) => setImportData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do deck..."
              rows={2}
              className="bg-gray-700/50 border-gray-600 text-white resize-none"
            />
          </div>

          <Button
            onClick={handleImport}
            disabled={!importData.name.trim() || !deckList.trim() || importing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importar Deck
              </>
            )}
          </Button>

          {importResult && (
            <div className={`p-3 rounded-lg border ${
              importResult.success 
                ? 'bg-green-900/20 border-green-600 text-green-400'
                : 'bg-red-900/20 border-red-600 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{importResult.message}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exportar Decks */}
      {decks.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Decks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {decks.map(deck => (
                <div key={deck.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-white font-medium">{deck.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {deck.format}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {deck.cards.reduce((sum, c) => sum + c.quantity, 0)} cartas
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => exportDeck(deck.id)}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Exportar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
