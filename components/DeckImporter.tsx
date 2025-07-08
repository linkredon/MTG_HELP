"use client"

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    try {
      await importarDeckDeLista(deckList, deckData);
      
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
        onImportSuccess(''); // We don't have the deck ID immediately
      }
      
      // Close dialog after a brief delay
      setTimeout(() => {
        setIsOpen(false);
        setImportStatus({ type: null, message: '' });
      }, 2000);
      
    } catch (error) {
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
        <Button
          variant="outline"
          className={`border-gray-600 text-gray-300 hover:bg-gray-700 ${className}`}
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar Deck
        </Button>
      </DialogTrigger>
      
      <DialogContent className="rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Importar Lista de Deck
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Deck */}
          <div className="space-y-4">
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Informações do Deck</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome do Deck *
                  </label>
                  <Input
                    value={deckData.name}
                    onChange={(e) => setDeckData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Burn Vermelho"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Formato
                  </label>
                  <Select 
                    value={deckData.format} 
                    onValueChange={(value) => setDeckData(prev => ({ ...prev, format: value }))}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Descrição (opcional)
                  </label>
                  <Textarea
                    value={deckData.description}
                    onChange={(e) => setDeckData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do deck..."
                    rows={3}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Preview das Cartas */}
            {deckList.trim() && (
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cardCounts.mainboard > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Deck Principal:</span>
                        <Badge variant="outline">{cardCounts.mainboard} cartas</Badge>
                      </div>
                    )}
                    {cardCounts.sideboard > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Sideboard:</span>
                        <Badge variant="outline">{cardCounts.sideboard} cartas</Badge>
                      </div>
                    )}
                    {cardCounts.commander > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Commander:</span>
                        <Badge variant="outline">{cardCounts.commander} cartas</Badge>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-600">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-white">Total:</span>
                        <Badge>{cardCounts.mainboard + cardCounts.sideboard + cardCounts.commander} cartas</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Lista de Cartas */}
          <div className="space-y-4">
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Lista de Cartas *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={deckList}
                  onChange={(e) => setDeckList(e.target.value)}
                  placeholder={`Cole sua lista de deck aqui...\n\nExemplo:\n${exampleList}`}
                  rows={12}
                  className="bg-gray-700/50 border-gray-600 text-white font-mono text-sm"
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
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Status da Importação */}
        {importStatus.type && (
          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            importStatus.type === 'success' 
              ? 'bg-green-900/20 border-green-600 text-green-300'
              : 'bg-red-900/20 border-red-600 text-red-300'
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
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-600">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isImporting}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!deckData.name.trim() || !deckList.trim() || isImporting}
            className="bg-blue-600 hover:bg-blue-700"
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
                 <Button
            onClick={handleImport}
            disabled={!deckData.name.trim() || !deckList.trim() || isImporting}
            className="bg-blue-600 hover:bg-blue-700"
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
      </DialogContent>
    </Dialog>
  );
};

export default DeckImporter;
