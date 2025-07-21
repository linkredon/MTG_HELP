'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';

export default function DataLoadTest() {
  const { loading, collections, decks, favorites } = useAppContext();
  const { isAuthenticated, user, isLoading: authLoading } = useAmplifyAuth();
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const results = {
      authLoading,
      isAuthenticated,
      hasUser: !!user,
      appLoading: loading,
      collectionsCount: collections.length,
      decksCount: decks.length,
      favoritesCount: favorites.length,
      timestamp: new Date().toISOString()
    };

    setTestResults(results);
    console.log('🔍 DataLoadTest - Status:', results);
  }, [authLoading, isAuthenticated, user, loading, collections.length, decks.length, favorites.length]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold text-yellow-800">Teste de Carregamento</h3>
        <p className="text-yellow-700">Usuário não autenticado</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded">
      <h3 className="font-bold text-blue-800">Teste de Carregamento</h3>
      <div className="text-sm text-blue-700 space-y-1">
        <p>Auth Loading: {authLoading ? 'Sim' : 'Não'}</p>
        <p>App Loading: {loading ? 'Sim' : 'Não'}</p>
        <p>Coleções: {collections.length}</p>
        <p>Decks: {decks.length}</p>
        <p>Favoritos: {favorites.length}</p>
        <p>Última atualização: {testResults.timestamp}</p>
      </div>
    </div>
  );
} 