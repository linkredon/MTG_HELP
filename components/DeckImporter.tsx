"use client"

import React, { useState } from 'react';
import '../styles/deck-builder-enhanced.css';
import '../styles/dropdown-fixes-enhanced.css';
import '../styles/modal-fix-enhanced.css';
import '../styles/deck-importer-enhanced.css';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Package } from 'lucide-react';

interface DeckImporterProps {
  onImportSuccess?: (deckId: string) => void;
  onImportError?: (error: string) => void;
  className?: string;
}

const DeckImporter: React.FC<DeckImporterProps> = ({
  onImportSuccess,
  onImportError,
  className = ""
}) => {
  const { importarDeckDeLista } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const [deckData, setDeckData] = useState({
    name: '',
    format: 'Standard',
    description: '',
    isPublic: false,
    tags: [] as string[],
    colors: [] as string[]
  });
  
  const [deckList, setDeckList] = useState('');

  const formats = [
    'Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 
    'Commander', 'Historic', 'Pauper', 'Brawl', 'Casual'
  ];

  const exampleList = `4 Lightning Bolt
4 Monastery Swiftspear
4 Lava Spike
3 Rift Bolt
4 Mountain
3 Ramunap Ruins

Sideboard:
2 Smash to Smithereens
3 Kor Firewalker
2 Deflecting Palm`;

  const handleImport = async () => {
    if (!deckData.name.trim() || !deckList.trim()) {
      setImportStatus({
        type: 'error',
        message: 'Nome do deck e lista de cartas são obrigatórios'
      });
      return;
    }

    setIsImporting(true);
    setImportStatus({ type: null, message: '' });
    
    // Verificar se a função importarDeckDeLista existe
    if (!importarDeckDeLista) {
      setImportStatus({
        type: 'error',
        message: 'Função de importação não disponível'
      });
      setIsImporting(false);
      return;
    }

    try {
      // Processar a lista para garantir formato correto
      const processedList = deckList
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      // Adicionar cabeçalhos de seção se não existirem
      let finalList = processedList;
      if (!finalList.toLowerCase().includes('mainboard:') && 
          !finalList.toLowerCase().includes('main deck:') && 
          !finalList.toLowerCase().includes('sideboard:') && 
          !finalList.toLowerCase().includes('commander:')) {
        // Se não tem seções, assume que tudo é mainboard
        finalList = 'Mainboard:\n' + finalList;
      }
      
      const deckId = await importarDeckDeLista(finalList, deckData);
      
      setImportStatus({
        type: 'success',
        message: `Deck "${deckData.name}" importado com sucesso!`
      });
      
      // Reset form
      setDeckData({
        name: '',
        format: 'Standard',
        description: '',
        isPublic: false,
        tags: [],
        colors: []
      });
      setDeckList('');
      
      if (onImportSuccess) {
        onImportSuccess(deckId);
      }
      
      // Close dialog after a brief delay
      setTimeout(() => {
        setIsOpen(false);
        setImportStatus({ type: null, message: '' });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao importar deck:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao importar deck';
      setImportStatus({
        type: 'error',
        message: errorMessage
      });
      
      if (onImportError) {
        onImportError(errorMessage);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const parsePreviewCards = () => {
    if (!deckList.trim()) return { mainboard: 0, sideboard: 0, commander: 0 };
    
    const lines = deckList.split('\n').filter(line => line.trim());
    let currentSection: 'mainboard' | 'sideboard' | 'commander' = 'mainboard';
    const counts = { mainboard: 0, sideboard: 0, commander: 0 };
    
    lines.forEach(line => {
      const trimmedLine = line.trim().toLowerCase();
      
      if (trimmedLine.includes('sideboard')) {
        currentSection = 'sideboard';
        return;
      }
      if (trimmedLine.includes('commander')) {
        currentSection = 'commander';
        return;
      }
      
      const match = line.match(/^(\d+)x?\s+(.+)$/);
      if (match) {
        const quantity = parseInt(match[1]);
        counts[currentSection] += quantity;
      }
    });
    
    return counts;
  };

  const cardCounts = parsePreviewCards();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className={`quantum-btn compact ${className}`}
        >
          <Upload className="w-4 h-4" />
          Importar Deck
        </button>
      </DialogTrigger>
      
      <DialogContent className="quantum-card-dense p-0 max-w-4xl dialog-content max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 border-b border-gray-700/50">
          <DialogTitle className="flex items-center gap-2 text-cyan-400">
            <FileText className="w-5 h-5" />
            Importar Lista de Deck
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Informações do Deck */}
            <div className="space-y-4">
              <div className="quantum-card-dense p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-white">Informações do Deck</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="mtg-label" htmlFor="deck-name">
                      Nome do Deck *
                    </label>
                    <input
                      id="deck-name"
                      type="text"
                      value={deckData.name}
                      onChange={(e) => setDeckData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Burn Vermelho"
                      className="mtg-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="mtg-label" htmlFor="deck-format">
                      Formato
                    </label>
                    <select
                      id="deck-format"
                      value={deckData.format}
                      onChange={(e) => setDeckData(prev => ({ ...prev, format: e.target.value }))}
                      className="mtg-select w-full"
                    >
                      {formats.map(format => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="mtg-label">
                      Descrição (opcional)
                    </label>
                    <Textarea
                      value={deckData.description}
                      onChange={(e) => setDeckData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do deck..."
                      rows={3}
                      className="mtg-textarea"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview das Cartas */}
              {deckList.trim() && (
                <div className="quantum-card-dense p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-medium text-white">Preview</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {cardCounts.mainboard > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Deck Principal:</span>
                        <Badge className="mtg-badge-primary">{cardCounts.mainboard} cartas</Badge>
                      </div>
                    )}
                    {cardCounts.sideboard > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Sideboard:</span>
                        <Badge className="mtg-badge-secondary">{cardCounts.sideboard} cartas</Badge>
                      </div>
                    )}
                    {cardCounts.commander > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Commander:</span>
                        <Badge className="mtg-badge-success">{cardCounts.commander} cartas</Badge>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-700/50">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-white">Total:</span>
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-0">
                          {cardCounts.mainboard + cardCounts.sideboard + cardCounts.commander} cartas
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Lista de Cartas */}
            <div className="quantum-card-dense p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-medium text-white">Lista de Cartas *</h3>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  value={deckList}
                  onChange={(e) => setDeckList(e.target.value)}
                  placeholder={`Cole sua lista de deck aqui...\n\nExemplo:\n${exampleList}`}
                  rows={12}
                  className="mtg-textarea font-mono text-sm"
                />
                
                <div className="text-xs text-gray-400">
                  <p className="mb-1">Formato aceito:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Quantidade seguida do nome: "4 Lightning Bolt"</li>
                    <li>Com 'x': "4x Lightning Bolt"</li>
                    <li>Seções: "Sideboard:" ou "Commander:"</li>
                    <li>Uma carta por linha</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status da Importação */}
          {importStatus.type && (
            <div className={`mt-4 p-3 rounded-lg border flex items-center gap-2 ${
              importStatus.type === 'success' 
                ? 'bg-green-900/20 border-green-600/50 text-green-300'
                : 'bg-red-900/20 border-red-600/50 text-red-300'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{importStatus.message}</span>
            </div>
          )}
          
          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-700/50">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isImporting}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!deckData.name.trim() || !deckList.trim() || isImporting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Importar Deck
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeckImporter;