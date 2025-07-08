"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Pencil, Save } from "lucide-react"
import Image from "next/image"
import type { SpoilerCard } from '@/types/mtg'

interface QuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onSave: (card: Partial<SpoilerCard>) => void
}

export default function QuickEditModal({ isOpen, onClose, imageUrl, onSave }: QuickEditModalProps) {
  const [cardDetails, setCardDetails] = useState<Partial<SpoilerCard>>({
    name: "",
    type_line: "",
    oracle_text: "",
    mana_cost: "",
    rarity: "common",
    set: "eoe",
    set_name: "Edges of Eternities",
    image_uris: { normal: imageUrl }
  })
  
  const handleSave = () => {
    onSave(cardDetails)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="quantum-card-dense fixed-modal max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-400" />
            Adicionar Detalhes da Carta
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative w-full aspect-[63/88] rounded-lg overflow-hidden mb-4">
              <Image
                src={imageUrl}
                alt="Prévia da carta"
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nome da Carta</label>
              <Input
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                placeholder="Nome da carta"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Custo de Mana</label>
              <Input
                value={cardDetails.mana_cost || ''}
                onChange={(e) => setCardDetails({...cardDetails, mana_cost: e.target.value})}
                placeholder="{2}{W}{U}"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Raridade</label>
              <select
                value={cardDetails.rarity || 'common'}
                onChange={(e) => setCardDetails({...cardDetails, rarity: e.target.value})}
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
              value={cardDetails.type_line || ''}
              onChange={(e) => setCardDetails({...cardDetails, type_line: e.target.value})}
              placeholder="Criatura — Humano Mago"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Texto</label>
            <Textarea
              value={cardDetails.oracle_text || ''}
              onChange={(e) => setCardDetails({...cardDetails, oracle_text: e.target.value})}
              placeholder="Texto da carta"
              rows={3}
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
            Salvar e Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}