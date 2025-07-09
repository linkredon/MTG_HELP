"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCardModal } from '@/contexts/CardModalContext';
import { Plus, Minus, Info, AlertCircle, Eye, ChevronDown, ChevronUp, Loader2, Search, Package, Star, Filter, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';
import { getImageUrl } from '@/utils/imageService';
import { getAllPrintsByNameWithTranslation } from '@/utils/scryfallService';
import CollectionIndicator from '@/components/CollectionIndicator';
import CardViewOptions from '@/components/CardViewOptions';

// Resto do código permanece igual...

// Modificando apenas a função fetchVersionCount para tratar erros corretamente
const fetchVersionCount = useCallback(async (card: MTGCard) => {
  if (cardVersionCounts[card.id] !== undefined) return; // Já tem a contagem
  
  try {
    console.log(`Buscando contagem de versões para: ${card.name}`);
    
    // Usar a API do Scryfall com &format=json&page=1 para pegar apenas a primeira página
    // e usar total_cards do response para saber quantas existem
    const url = `https://api.scryfall.com/cards/search?q="${encodeURIComponent(card.name)}"+unique:prints&order=released&page=1`;
    
    try {
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const totalVersions = data.total_cards || 0;
        const currentCardVersions = totalVersions > 0 ? totalVersions - 1 : 0; // Subtraí 1 pois não conta a carta atual
        
        setCardVersionCounts(prev => ({
          ...prev,
          [card.id]: currentCardVersions
        }));
        
        console.log(`${card.name} tem ${currentCardVersions} versões alternativas`);
      } else if (response.status === 404) {
        // Não encontrou versões
        setCardVersionCounts(prev => ({
          ...prev,
          [card.id]: 0
        }));
      }
    } catch (error) {
      console.error(`Erro ao buscar contagem de versões para ${card.name}:`, error);
      // Em caso de erro de rede, definir como 0
      setCardVersionCounts(prev => ({
        ...prev,
        [card.id]: 0
      }));
    }
  } catch (error) {
    console.error(`Erro ao processar busca de versões para ${card.name}:`, error);
    setCardVersionCounts(prev => ({
      ...prev,
      [card.id]: 0
    }));
  }
}, [cardVersionCounts]);

// Resto do código permanece igual...