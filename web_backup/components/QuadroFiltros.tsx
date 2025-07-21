"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Definição dos tipos para as props do componente
interface QuadroFiltrosProps {
  busca: string;
  setBusca: (value: string) => void;
  raridade: string;
  setRaridade: (value: string) => void;
  cmc: string;
  setCmc: (value: string) => void;
  foil: string;
  setFoil: (value: string) => void;
  tipo: string;
  setTipo: (value: string) => void;
  subtipo: string;
  setSubtipo: (value: string) => void;
  supertipo: string;
  setSupertipo: (value: string) => void;
  oracleText: string;
  setOracleText: (value: string) => void;
  manaColors: string[];
  setManaColors: (value: string[]) => void;
  raridades: string[];
  foils: string[];
  tipos: string[];
  subtipos: string[];
  supertipos: string[];
  coresMana: string[];
}

// Definição das informações das cores de mana
const manaColorInfo = {
  'W': { 
    name: 'Branco', 
    symbol: 'W',
    color: '#FFFBD5',
    darkColor: '#F8F6D8'
  },
  'U': { 
    name: 'Azul', 
    symbol: 'U',
    color: '#0E68AB',
    darkColor: '#1E88E5'
  },
  'B': { 
    name: 'Preto', 
    symbol: 'B',
    color: '#150B00',
    darkColor: '#424242'
  },
  'R': { 
    name: 'Vermelho', 
    symbol: 'R',
    color: '#D3202A',
    darkColor: '#E53935'
  },
  'G': { 
    name: 'Verde', 
    symbol: 'G',
    color: '#00733E',
    darkColor: '#43A047'
  },
  'C': { 
    name: 'Incolor', 
    symbol: 'C',
    color: '#CCC2C0',
    darkColor: '#9E9E9E'
  }
};

// Componente principal
const QuadroFiltros: React.FC<QuadroFiltrosProps> = ({
  busca,
  setBusca,
  raridade,
  setRaridade,
  cmc,
  setCmc,
  foil,
  setFoil,
  tipo,
  setTipo,
  subtipo,
  setSubtipo,
  supertipo,
  setSupertipo,
  oracleText,
  setOracleText,
  manaColors,
  setManaColors,
  raridades,
  foils,
  tipos,
  subtipos,
  supertipos,
  coresMana
}) => {

  // Função para alternar cores de mana
  const toggleManaColor = (color: string) => {
    if (!color) return;
    
    const currentColors = Array.isArray(manaColors) ? manaColors : [];
    
    if (currentColors.includes(color)) {
      setManaColors(currentColors.filter(c => c !== color));
    } else {
      setManaColors([...currentColors, color]);
    }
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setBusca("");
    setRaridade("all");
    setCmc("");
    setFoil("all");
    setTipo("all");
    setSubtipo("all");
    setSupertipo("all");
    setOracleText("");
    setManaColors([]);
  };

  // Helper para traduzir raridades
  const translateRarity = (rarity: string) => {
    const translations: { [key: string]: string } = {
      'all': 'Todas as Raridades',
      'common': 'Comum',
      'uncommon': 'Incomum',
      'rare': 'Rara',
      'mythic': 'Mítica',
      'special': 'Especial',
      'bonus': 'Bônus'
    };
    return translations[rarity] || rarity;
  };

  // Helper para traduzir foil
  const translateFoil = (foilType: string) => {
    const translations: { [key: string]: string } = {
      'all': 'Todos',
      'foil': 'Apenas Foil',
      'nonfoil': 'Apenas Não-Foil'
    };
    return translations[foilType] || foilType;
  };

  // Helper para traduzir tipos
  const translateType = (typeValue: string) => {
    const translations: { [key: string]: string } = {
      'all': 'Todos os Tipos',
      'creature': 'Criatura',
      'artifact': 'Artefato',
      'enchantment': 'Encantamento',
      'instant': 'Instantâneo',
      'sorcery': 'Feitiço',
      'planeswalker': 'Planeswalker',
      'land': 'Terreno',
      'token': 'Ficha',
      'artifact creature': 'Criatura Artefato',
      'enchantment creature': 'Criatura Encantamento'
    };
    return translations[typeValue] || typeValue;
  };

  // Helper para traduzir supertipos
  const translateSupertype = (supertype: string) => {
    const translations: { [key: string]: string } = {
      'all': 'Todos os Supertipos',
      'legendary': 'Lendário',
      'basic': 'Básico',
      'snow': 'Neve',
      'world': 'Mundo',
      'ongoing': 'Contínuo'
    };
    return translations[supertype] || supertype;
  };

  return (
    <div className="space-y-6 p-4 filters-container rounded-lg border">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Filtros Avançados</h3>
        <button 
          onClick={clearAllFilters}
          className="quantum-btn compact"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Busca por nome */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Busca por Nome</label>
        <Input 
          type="text"
          value={busca || ""}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome da carta..."
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
      </div>

      {/* Primeira linha de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Raridade */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Raridade</label>
          <Select value={raridade || "all"} onValueChange={setRaridade}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-blue-500">
              <SelectValue placeholder="Selecione uma raridade" className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {(raridades || []).map((r) => (
                <SelectItem 
                  key={r} 
                  value={r} 
                  className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                >
                  {translateRarity(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CMC */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Custo de Mana (CMC)</label>
          <Input 
            type="text"
            value={cmc || ""}
            onChange={(e) => setCmc(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Ex: 3"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Foil */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Foil</label>
          <Select value={foil || "all"} onValueChange={setFoil}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-blue-500">
              <SelectValue placeholder="Selecione foil/não foil" className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {(foils || []).map((f) => (
                <SelectItem 
                  key={f} 
                  value={f} 
                  className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                >
                  {translateFoil(f)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Segunda linha de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tipo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Tipo</label>
          <Select value={tipo || "all"} onValueChange={setTipo}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-blue-500">
              <SelectValue placeholder="Selecione um tipo" className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {(tipos || []).map((t) => (
                <SelectItem 
                  key={t} 
                  value={t} 
                  className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                >
                  {translateType(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subtipo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Subtipo</label>
          <Select value={subtipo || "all"} onValueChange={setSubtipo}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-blue-500">
              <SelectValue placeholder="Selecione um subtipo" className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {(subtipos || []).map((st) => (
                <SelectItem 
                  key={st} 
                  value={st} 
                  className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                >
                  {st === "all" ? "Todos os Subtipos" : st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supertipo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Supertipo</label>
          <Select value={supertipo || "all"} onValueChange={setSupertipo}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-blue-500">
              <SelectValue placeholder="Selecione um supertipo" className="text-white" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {(supertipos || []).map((spt) => (
                <SelectItem 
                  key={spt} 
                  value={spt} 
                  className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                >
                  {translateSupertype(spt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Texto do Oráculo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Texto do Oráculo</label>
        <Input 
          type="text"
          value={oracleText || ""}
          onChange={(e) => setOracleText(e.target.value)}
          placeholder="Ex: voar, atropelar, vigilância..."
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
      </div>

      {/* Cores de Mana */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">Cores de Mana</label>
        <div className="flex flex-wrap gap-3">
          {(coresMana || []).map((color) => {
            const colorInfo = manaColorInfo[color as keyof typeof manaColorInfo];
            if (!colorInfo) return null;
            
            const isSelected = Array.isArray(manaColors) && manaColors.includes(color);
            
            return (
              <button
                key={color}
                onClick={() => toggleManaColor(color)}
                className={`quantum-btn ${isSelected ? 'primary' : 'compact'}`}
                style={isSelected ? {
                  backgroundColor: colorInfo.darkColor,
                  borderColor: colorInfo.darkColor,
                } : {}}
                title={`${colorInfo.name} - Clique para selecionar/deselecionar`}
              >
                <span className="text-lg font-bold">{colorInfo.symbol}</span>
                <span className="hidden sm:inline text-sm">{colorInfo.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* Indicador de cores selecionadas */}
        {Array.isArray(manaColors) && manaColors.length > 0 && (
          <div className="text-sm text-gray-400">
            Cores selecionadas: {manaColors.map(color => 
              manaColorInfo[color as keyof typeof manaColorInfo]?.name || color
            ).join(', ')}
          </div>
        )}
      </div>

    </div>
  );
};

export default QuadroFiltros;
