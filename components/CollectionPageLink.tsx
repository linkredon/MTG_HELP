"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

export default function CollectionPageLink() {
  return (
    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-white mb-1">Nova Interface de Coleção</h3>
          <p className="text-sm text-gray-300 max-w-xl">
            Experimente nossa nova interface melhorada para gerenciar sua coleção de Magic: The Gathering com recursos avançados e experiência de uso otimizada.
          </p>
        </div>
        <div>
          <Link href="/colecao-improved">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Experimentar nova versão
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
