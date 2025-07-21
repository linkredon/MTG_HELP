'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import EnhancedSearchCardList from '@/components/EnhancedSearchCardList';
import { Loader2 } from 'lucide-react';
import type { MTGCard } from '@/types/mtg';

// URL para buscar as cartas
const SEARCH_URL = 'https://api.scryfall.com/cards/search?q=set:neo+r:mythic';

export default function EnhancedSearchExample() {
  const [cards, setCards] = useState<MTGCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<Array<{card: MTGCard, quantity: number, condition: string, foil: boolean}>>([]);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados ao carregar a página
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await fetch(SEARCH_URL);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar cartas');
        }
        
        const data = await response.json();
        setCards(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Erro:', err);
        setError('Falha ao carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Função para adicionar carta à coleção
  const handleAddCard = (card: MTGCard, quantity: number = 1) => {
    setCollection(prev => {
      // Verificar se a carta já está na coleção
      const existingCardIndex = prev.findIndex(item => item.card.id === card.id);
      
      if (existingCardIndex >= 0) {
        // Atualizar quantidade se já existir
        const updated = [...prev];
        updated[existingCardIndex] = {
          ...updated[existingCardIndex],
          quantity: updated[existingCardIndex].quantity + quantity
        };
        return updated;
      } else {
        // Adicionar nova carta
        return [...prev, { 
          card, 
          quantity, 
          condition: 'NM',
          foil: false
        }];
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Exemplo de Busca com Versões
        </h1>
        <p className="text-gray-300 mb-4">
          Este exemplo demonstra o componente EnhancedSearchCardList com suporte a versões alternativas.
        </p>
        
        {collection.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-lg border border-gray-800 mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Sua Coleção ({collection.reduce((sum, item) => sum + item.quantity, 0)} cartas)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {collection.map((item) => (
                <div 
                  key={item.card.id} 
                  className="flex items-center gap-2 p-2 bg-gray-800/50 rounded border border-gray-700"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center text-white font-bold">
                    {item.quantity}x
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.card.name}</div>
                    <div className="text-xs text-gray-400 truncate">{item.card.set_name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-gray-900/30 rounded-xl border border-gray-800">
          <Loader2 className="animate-spin text-blue-500 mr-2" />
          <span className="text-gray-300">Carregando cartas...</span>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 text-red-300 p-4 rounded-lg border border-red-900/50 text-center">
          {error}
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2 bg-red-900/30 hover:bg-red-800/50 border-red-900/50"
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <EnhancedSearchCardList 
          cards={cards}
          collection={collection}
          onAddCard={handleAddCard}
        />
      )}
    </div>
  );
}
