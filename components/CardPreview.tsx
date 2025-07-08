"use client"

import { Dialog, DialogContent } from "./ui/dialog"
import Image from "next/image"
import type { MTGCard } from '@/types/mtg'

// Interface local para cartas de spoiler
interface SpoilerCard extends Partial<MTGCard> {
  set?: string;
  set_name?: string;
  spoilerSource?: string;
}

interface CardPreviewProps {
  isOpen: boolean
  onClose: () => void
  card: SpoilerCard | null
}

export default function CardPreview({ isOpen, onClose, card }: CardPreviewProps) {
  if (!card) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="quantum-card-dense fixed-modal max-w-md p-2">
        <div className="relative w-full">
          <Image
            src={card.image_uris?.normal || '/placeholder.png'}
            alt={card.name || 'Carta sem nome'}
            width={480}
            height={680}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}