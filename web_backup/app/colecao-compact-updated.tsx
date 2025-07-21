"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SimpleSelect from "@/components/SimpleSelect"
import { Textarea } from "@/components/ui/textarea"
import { useCardModal } from "@/contexts/CardModalContext"
import { useAppContext } from "@/contexts/AppContext"
import CardViewOptions from "@/components/CardViewOptions"
import CardList from "@/components/CardList"
import SearchCardList from "@/components/SearchCardList"
import EnhancedSearchCardList from "@/components/EnhancedSearchCardList"
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService'
import { getImageUrl, getDoubleFacedImageUrls } from '@/utils/imageService'
import { searchCardsWithTranslation, getAllPrintsByNameWithTranslation } from '@/utils/scryfallService'
import ExpandableCardGrid from '@/components/ExpandableCardGrid'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ImportCollectionModal from "@/components/ImportCollectionModal"
import { Search, Library, Plus, Minus, Download, AlertCircle, Save, Upload, Copy, Grid3X3, Settings, User, Clock, Bookmark, Heart, Trash2, Star, Filter, Eye, EyeOff, RefreshCw, ExternalLink, Package, Edit3, FileText, History } from "lucide-react"
import "@/styles/palette.css"
import "@/styles/card-search-enhanced.css"
import "@/styles/filtros-fix.css"
import "@/styles/dropdown-z-fix.css"
import "@/styles/ambient-glow.css"
import CollectionBox from "@/components/CollectionBox"

// Função utilitária para seguramente acessar propriedades de cartas
const safeCardAccess = {
  // ... (código existente)
}

import type { MTGCard, UserCollection, CollectionCard } from '@/types/mtg';

interface ColecaoProps {
  allCards: MTGCard[]
  setAllCards: (cards: MTGCard[]) => void
  exportCollectionToCSV: (collection: UserCollection) => void
}

// Constantes para filtros
const raridades = ["all", "common", "uncommon", "rare", "mythic", "special", "bonus"]
const tipos = [
  "all", "creature", "artifact", "enchantment", "instant", "sorcery", 
  "planeswalker", "land", "token", "artifact creature", "enchantment creature"
]
const subtipos = [
  "all", "elf", "goblin", "zombie", "angel", "dragon", "vampire", "wizard", 
  "warrior", "human", "beast", "spirit", "sliver", "merfolk", "dinosaur", 
  "giant", "elemental", "knight", "soldier", "rogue", "cleric"
]
const supertipos = ["all", "legendary", "basic", "snow", "world", "ongoing"]
const foils = ["all", "foil", "nonfoil"]
const coresMana = ["W", "U", "B", "R", "G", "C"]

export default function ColecaoCompact({
  allCards,
  setAllCards,
  exportCollectionToCSV,
}: ColecaoProps) {
  // Usar o contexto global para coleção
  const {
    collections,
    currentCollection,
    currentCollectionId,
    setCurrentCollectionId,
    createCollection,
    deleteCollection,
    duplicateCollection,
    adicionarCarta,
    removerCarta,
    updateCollection
  } = useAppContext();
  
  const [editingCollection, setEditingCollection] = useState<UserCollection | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState<string | null>(null);
  
  // Estado para o modal de importação
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Estados para navegação entre tabs da coleção - apenas Pesquisa, Coleção e Estatísticas
  const [tab, setTab] = useState<string>("pesquisa")
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false)
  const [mostrarCartasNaColecao, setMostrarCartasNaColecao] = useState(false)
  
  // Estados para notificações/feedback
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false })

  // ... (código existente)

  // Função para mostrar notificações
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Handler para importação bem-sucedida
  const handleImportSuccess = useCallback((importedCount: number) => {
    showNotification('success', `Importação concluída! ${importedCount} cartas adicionadas à coleção.`);
  }, [showNotification]);

  // ... (código existente)

  return (
    <div className="quantum-compact relative">
      <div className="ambient-glow pointer-events-none"></div>
      {/* Notificação */}
      {notification.visible && (
        <div className={`quantum-notification ${
          notification.type === 'success' ? 'quantum-notification-success' :
          notification.type === 'error' ? 'quantum-notification-error' : 'quantum-notification-info'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Modal de importação */}
      <ImportCollectionModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* ... (código existente) */}

      {tab === "colecao" && (
        <div className="space-y-2">
          {/* Grid de Coleções */}
          <div className="quantum-card-dense p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">Minhas Coleções</h2>
                </div>
                <Button onClick={() => createCollection("Nova Coleção")} className="quantum-btn compact primary">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Nova Coleção
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {collections.map(col => (
                <CollectionBox
                  key={col.id}
                  collection={col}
                  onSelect={setCurrentCollectionId}
                  onDelete={deleteCollection}
                  onEdit={(id) => setEditingCollection(collections.find(c => c.id === id) || null)}
                  onDuplicate={duplicateCollection}
                  onSetBackground={setShowBackgroundSelector}
                  isActive={currentCollectionId === col.id}
                />
              ))}
            </div>
          </div>

          {/* ... (código existente) */}

          {!currentCollection ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma coleção selecionada. Crie uma para começar.</p>
            </div>
          ) : (
            <>
              {/* Header da Coleção */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="quantum-title">{currentCollection.name}</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsImportModalOpen(true)}
                    className="quantum-btn compact bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                    disabled={!currentCollection}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Importar
                  </Button>
                  <Button
                    onClick={() => exportCollectionToCSV(currentCollection)}
                    className="quantum-btn compact"
                    size="sm"
                    disabled={!currentCollection}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>

              {/* ... (resto do código existente) */}
            </>
          )}
        </div>
      )}

      {/* ... (resto do código existente) */}
    </div>
  )
}