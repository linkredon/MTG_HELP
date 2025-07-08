"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Pencil, Save } from "lucide-react"
import Image from "next/image"
import type { MTGCard } from '@/types/mtg'

// Interface local para cartas de spoiler
interface SpoilerCard extends Partial<MTGCard> {
  set?: string;
  set_name?: string;
  spoilerSource?: string;
}

interface EditCardModalProps {
  isOpen: boolean
  onClose: () => void
  card: SpoilerCard | null
  onSave: (card: SpoilerCard) => void
}

export default function EditCardModal({ isOpen, onClose, card, onSave }: EditCardModalProps) {
  const [editedCard, setEditedCard] = useState<SpoilerCard | null>(card)
  
  // Atualizar o estado quando a carta mudar
  if (card && (!editedCard || editedCard.id !== card.id)) {
    setEditedCard(card)
  }
  
  if (!editedCard) return null
  
  const handleSave = () => {
    if (editedCard) {
      onSave(editedCard)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="quantum-card-dense fixed-modal max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-400" />
            Editar Carta
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative w-full aspect-[63/88] rounded-lg overflow-hidden mb-4">
              <Image
                src={editedCard.image_uris?.normal || '/placeholder.png'}
                alt={editedCard.name || 'Carta sem nome'}
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nome da Carta</label>
              <Input
                value={editedCard.name}
                onChange={(e) => setEditedCard({...editedCard, name: e.target.value})}
                placeholder="Nome da carta"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Custo de Mana</label>
              <Input
                value={editedCard.mana_cost || ''}
                onChange={(e) => setEditedCard({...editedCard, mana_cost: e.target.value})}
                placeholder="{2}{W}{U}"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Raridade</label>
              <select
                value={editedCard.rarity || 'common'}
                onChange={(e) => setEditedCard({...editedCard, rarity: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-white"
              >
                <option value="common">Comum</option>
                <option value="uncommon">Incomum</option>
                <option value="rare">Rara</option>
                <option value="mythic">Mítica</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Linha de Tipo</label>
            <Input
              value={editedCard.type_line || ''}
              onChange={(e) => setEditedCard({...editedCard, type_line: e.target.value})}
              placeholder="Criatura — Humano Mago"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Texto</label>
            <Textarea
              value={editedCard.oracle_text || ''}
              onChange={(e) => setEditedCard({...editedCard, oracle_text: e.target.value})}
              placeholder="Texto da carta"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Fonte do Spoiler</label>
            <Input
              value={editedCard.spoilerSource || ''}
              onChange={(e) => setEditedCard({...editedCard, spoilerSource: e.target.value})}
              placeholder="Wizards.com, Twitter, etc."
            />
          </div>
        </div>
        
        <DialogFooter className="mt-4 pt-2 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-1" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}