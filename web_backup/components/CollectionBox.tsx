"use client"

import {
  Package,
  Trash2,
  Edit3,
  Eye,
  Plus,
  FileText,
  Copy,
  Image
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { UserCollection } from '@/types/mtg'

interface CollectionBoxProps {
  collection: UserCollection;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetBackground: (id: string) => void;
  isActive: boolean;
}

export default function CollectionBox({ collection, onSelect, onDelete, onEdit, onDuplicate, onSetBackground, isActive }: CollectionBoxProps) {
  const totalCards = collection.cards ? collection.cards.reduce((sum, card) => sum + card.quantity, 0) : 0;
  const uniqueCards = collection.cards ? collection.cards.length : 0;

  return (
    <div
      className={`quantum-card-dense hover-highlight group relative overflow-hidden ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
      onClick={() => onSelect(collection.id)}
    >
      {collection.backgroundImage && (
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          <img
            src={collection.backgroundImage}
            alt=""
            className="w-full h-full object-cover filter blur-sm"
          />
        </div>
      )}
      <div className="p-3 border-b border-cyan-500/20 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-white truncate">{collection.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Badge className="bg-gray-700/60 text-gray-200 text-[10px] h-4 px-1">
                <FileText className="w-2 h-2 mr-1" />
                Coleção
              </Badge>
            </div>
          </div>
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(collection.id); }}
              className="p-1 text-gray-400 hover:text-cyan-400 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(collection.id); }}
              className="p-1 text-gray-400 hover:text-cyan-400 transition"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSetBackground(collection.id); }}
              className="p-1 text-gray-400 hover:text-cyan-400 transition"
            >
              <Image className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(collection.id); }}
              className="p-1 text-gray-400 hover:text-red-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-3 text-xs text-gray-400 relative z-10">
        <div className="flex justify-between items-center mb-1">
          <span>Cartas únicas:</span>
          <span className="font-mono text-cyan-400">{uniqueCards}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span>Total de cartas:</span>
          <span className="font-mono text-cyan-400">{totalCards}</span>
        </div>
        
        {collection.description && (
          <div className="mt-2 border-t border-gray-800 pt-2 line-clamp-2 text-[11px]">
            {collection.description}
          </div>
        )}
      </div>
      
      <div 
        className="p-2 bg-gradient-to-r from-transparent via-cyan-900/10 to-transparent cursor-pointer relative z-10"
      >
        <div className="flex justify-center items-center gap-1 text-[11px] text-gray-500 group-hover:text-cyan-400">
          <Eye className="w-3 h-3" />
          <span>{isActive ? 'Selecionada' : 'Selecionar'}</span>
        </div>
      </div>
    </div>
  );
}