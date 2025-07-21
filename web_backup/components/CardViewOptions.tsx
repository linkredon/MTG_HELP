"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, Grid2X2, Grid3X3, List, Columns } from 'lucide-react';
import { useCardModal, CardVisualizationType } from '@/contexts/CardModalContext';

interface CardViewOptionsProps {
  className?: string;
  size?: 'default' | 'sm';
}

const CardViewOptions: React.FC<CardViewOptionsProps> = ({ 
  className = '',
  size = 'default'
}) => {
  const { visualizationType, setVisualizationType } = useCardModal();

  const buttonSize = size === 'sm' ? 'h-7 w-7 p-1' : 'h-9 w-9 p-2';

  return (
    <div className={`inline-flex items-center rounded-md overflow-hidden shadow-sm shadow-blue-500/10 ${className}`}>
      <Button
        variant={visualizationType === 'list' ? 'default' : 'outline'}
        size="icon"
        className={`${buttonSize} ${visualizationType === 'list' 
          ? 'bg-blue-600 hover:bg-blue-700 rounded-none border-0' 
          : 'border-0 rounded-none text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
        onClick={() => setVisualizationType('list')}
        title="Lista: Visualização compacta em linhas (ideal para ver muitas cartas)"
        aria-label="Visualização em lista"
      >
        <List className="h-4 w-4" />
        {size !== 'sm' && <span className="ml-1 text-xs">Lista</span>}
      </Button>
      
      <div className="w-[1px] h-full bg-gray-700 opacity-50"></div>
      
      <Button
        variant={visualizationType === 'grid' ? 'default' : 'outline'}
        size="icon"
        className={`${buttonSize} ${visualizationType === 'grid' 
          ? 'bg-blue-600 hover:bg-blue-700 rounded-none border-0' 
          : 'border-0 rounded-none text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
        onClick={() => setVisualizationType('grid')}
        title="Grade: Visualização em miniaturas (melhor para ver imagens das cartas)"
        aria-label="Visualização em grade"
      >
        <Grid2X2 className="h-4 w-4" />
        {size !== 'sm' && <span className="ml-1 text-xs">Grade</span>}
      </Button>
      
      <div className="w-[1px] h-full bg-gray-700 opacity-50"></div>
      
      <Button
        variant={visualizationType === 'details' ? 'default' : 'outline'}
        size="icon"
        className={`${buttonSize} ${visualizationType === 'details' 
          ? 'bg-blue-600 hover:bg-blue-700 rounded-none border-0' 
          : 'border-0 rounded-none text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
        onClick={() => setVisualizationType('details')}
        title="Detalhes: Visualização expandida com informações completas (ideal para ler os textos das cartas)"
        aria-label="Visualização em detalhes"
      >
        <Columns className="h-4 w-4" />
        {size !== 'sm' && <span className="ml-1 text-xs">Detalhes</span>}
      </Button>
    </div>
  );
};

export default CardViewOptions;
