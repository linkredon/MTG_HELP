"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCardModal } from '@/contexts/CardModalContext'
import CardViewOptions from '@/components/CardViewOptions'
import CardList from '@/components/CardList'
import type { MTGCard } from '@/types/mtg'

export default function BuscaDeCartasPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<MTGCard[]>([]);
  
  // Usando o contexto global do CardModal
  const { mostrarCartasNaColecao, toggleMostrarCartasNaColecao, adicionarCarta } = useCardModal();
  
  const buscarCartas = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name`);
      const data = await response.json();
      
      if (data.object === 'error') {
        setError(data.details);
        setResultados([]);
      } else if (data.data && data.data.length > 0) {
        setResultados(data.data);
      } else {
        setResultados([]);
        setError('Nenhuma carta encontrada');
      }
    } catch (err) {
      setError('Erro ao buscar cartas: ' + (err instanceof Error ? err.message : String(err)));
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Busca de Cartas</h1>
      
      {/* Formulário de busca */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <Input
            placeholder="Digite o nome da carta, tipo, texto, etc..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarCartas()}
            className="bg-gray-800 text-white border-gray-700"
          />
        </div>
        <Button 
          onClick={buscarCartas}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
      
      {/* Filtros e opções de visualização */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <Button
            variant="outline"
            onClick={toggleMostrarCartasNaColecao}
            className={`text-sm ${mostrarCartasNaColecao ? 'border-green-600 text-green-400' : 'border-gray-600 text-gray-400'}`}
          >
            {mostrarCartasNaColecao ? '✓ Mostrar cartas na coleção' : '○ Ocultar cartas na coleção'}
          </Button>
        </div>
        
        {/* Opções de visualização */}
        <CardViewOptions />
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-900/50 border border-red-800 text-white p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Resultados da busca */}
      {resultados.length > 0 && (
        <div>
          <h2 className="text-xl font-medium mb-4">Resultados ({resultados.length} cartas)</h2>
          
          {/* Usando o componente CardList com as opções de visualização */}
          <CardList 
            cards={resultados}
            showActionButton={true}
            actionButtonLabel="Adicionar"
            onActionButtonClick={(card) => adicionarCarta(card)}
            className="mb-8"
          />
        </div>
      )}
    </div>
  )
}
