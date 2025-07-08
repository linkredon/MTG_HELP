"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Plus, Minus, Grid, List, Check } from 'lucide-react';

interface QuantityControlProps {
  initialValue?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  showPresets?: boolean;
  className?: string;
}

export default function QuantityControl({
  initialValue = 1,
  onChange,
  min = 1,
  max = 99,
  showPresets = true,
  className = '',
}: QuantityControlProps) {
  const [value, setValue] = useState(initialValue);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAdding, setIsAdding] = useState(false);

  // Atualiza o estado local quando o initialValue muda
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const increment = () => {
    const newValue = Math.min(value + 1, max);
    setValue(newValue);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - 1, min);
    setValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value, 10);
    
    if (isNaN(inputValue)) {
      setValue(min);
      onChange(min);
      return;
    }
    
    const newValue = Math.max(min, Math.min(inputValue, max));
    setValue(newValue);
    onChange(newValue);
  };

  const setPresetValue = (presetValue: number) => {
    setValue(presetValue);
    onChange(presetValue);
  };

  const toggleVersions = () => {
    setIsVersionsOpen(!isVersionsOpen);
  };
  
  // Função para adicionar com animação de feedback
  const handleAddCard = () => {
    setIsAdding(true);
    onChange(value);
    
    // Resetar estado após animação
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  return (
    <div className={`quantity-control-modern flex flex-col gap-2 ${className}`}>
      <div className="quantity-control-wrapper flex items-center gap-2">
        {/* Controle de quantidade com estilo refinado */}
        <div className="flex items-center h-9 rounded-md border border-gray-600 overflow-hidden shadow-inner shadow-blue-900/10">
          <button
            onClick={decrement}
            disabled={value <= min}
            className="w-8 h-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Diminuir quantidade"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="quantity-input w-12 h-full text-center bg-gray-700/70 border-none text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Quantidade"
          />
          
          <button
            onClick={increment}
            disabled={value >= max}
            className="w-8 h-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Aumentar quantidade"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Botão de adição com animação */}
        <Button 
          onClick={handleAddCard}
          className={`${isAdding ? 'btn-add-success bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white flex-grow h-9 transition-all`}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <span>Adicionado!</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              <span>Adicionar</span>
              {value > 1 && <span className="ml-1">{value}x</span>}
            </>
          )}
        </Button>
        
        {/* Botão de versões */}
        <Button 
          onClick={toggleVersions}
          variant="outline" 
          className={`versions-toggle h-9 w-9 p-0 border-gray-600 ${isVersionsOpen ? 'bg-blue-900/20 border-blue-500/50' : ''}`}
          aria-label="Mostrar versões"
        >
          {isVersionsOpen ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Presets rápidos de quantidade */}
      {showPresets && (
        <div className="flex gap-1 mt-0.5">
          {[1, 4].map((preset) => (
            <Button
              key={preset}
              onClick={() => setPresetValue(preset)}
              variant="outline"
              size="sm"
              className={`quantity-preset min-w-[36px] h-7 px-2 py-0 text-xs ${
                value === preset 
                  ? 'active bg-blue-900/30 border-blue-700/50 text-blue-200' 
                  : 'bg-transparent border-gray-700 text-gray-300'
              } transition-all`}
            >
              {preset}x
            </Button>
          ))}
        </div>
      )}
      
      {/* Área de versões com toggle de visualização */}
      {isVersionsOpen && (
        <div className="versions-panel mt-2 rounded-md border border-gray-700 bg-gray-800/70 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
            <div className="text-sm font-medium text-gray-200">Outras versões</div>
            
            {/* Toggles para modo de visualização */}
            <div className="flex items-center gap-1 rounded-md bg-gray-900/50 p-0.5">
              <Button
                onClick={() => setViewMode('grid')}
                size="sm"
                variant="ghost"
                className={`h-7 px-2 py-0 ${viewMode === 'grid' ? 'bg-blue-600/30 text-blue-200' : 'text-gray-400'}`}
              >
                <Grid className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                size="sm"
                variant="ghost"
                className={`h-7 px-2 py-0 ${viewMode === 'list' ? 'bg-blue-600/30 text-blue-200' : 'text-gray-400'}`}
              >
                <List className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="p-3">
            {/* Modo Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Exemplos de cartas - em um cenário real, isso seria mapeado a partir de dados */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="card-version-grid rounded-md border border-gray-700/50 overflow-hidden bg-gray-800/50 hover:border-blue-500/50 hover:bg-gray-700/70 transition-all">
                    <div className="aspect-[63/88] bg-gray-900/70 flex items-center justify-center">
                      {/* Placeholder para imagem */}
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                        <span className="text-xs text-blue-400">SET-{item}</span>
                      </div>
                    </div>
                    <div className="p-2 text-center">
                      <div className="text-xs font-medium truncate">Versão {item}</div>
                      <div className="text-[10px] text-gray-400 truncate">Conjunto {item}</div>
                      <Button 
                        size="sm" 
                        className="w-full h-6 mt-1 bg-blue-600 hover:bg-blue-700 text-xs py-0" 
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Modo Lista */}
            {viewMode === 'list' && (
              <div className="space-y-1">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="card-version-list flex items-center gap-2 p-2 rounded-md border border-gray-700/50 bg-gray-800/50 hover:border-blue-500/50 hover:bg-gray-700/70 transition-all">
                    {/* Thumbnail */}
                    <div className="w-10 h-14 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-blue-400">SET-{item}</span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">Versão {item}</div>
                      <div className="text-[10px] text-gray-400">Conjunto {item} • #{item} • Raridade</div>
                    </div>
                    
                    {/* Botão de adicionar */}
                    <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-xs py-0">
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
