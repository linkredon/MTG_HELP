"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Esta é uma página de diagnóstico para problemas de autenticação
export default function UserBypassPage() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        // Verificar cookies do navegador
        const allCookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as {[key: string]: string});
        
        setCookies(allCookies);
        
        // Tentar obter dados do usuário via API
        const res = await fetch('/api/users/me');
        const data = await res.json();
        
        if (data.success && data.user) {
          setUserData(data.user);
        } else {
          setError('Não foi possível carregar dados do usuário via API');
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setError('Erro ao verificar autenticação');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuthStatus();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-4">Diagnóstico de Autenticação</h1>
          
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-2">Status da Autenticação</h2>
                {error ? (
                  <div className="text-red-400">{error}</div>
                ) : userData ? (
                  <div className="text-green-400">Usuário autenticado! ✅</div>
                ) : (
                  <div className="text-red-400">Usuário não autenticado! ❌</div>
                )}
              </div>
              
              {userData && (
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-white mb-2">Dados do Usuário</h2>
                  <pre className="bg-black p-3 rounded overflow-auto text-xs text-green-400">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="bg-gray-900 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-2">Cookies Disponíveis</h2>
                {Object.keys(cookies).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(cookies).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-blue-400">{key}</span>: 
                        <span className="text-gray-400 ml-1">{value.slice(0, 20)}...</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-red-400">Nenhum cookie encontrado</div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                <a href="/user/profile" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                  Página de Perfil
                </a>
                <a href="/user/personalization" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition">
                  Personalização
                </a>
                <a href="/user/settings" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
                  Configurações
                </a>
                <a href="/" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition">
                  Página Inicial
                </a>
                <a href="/login" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">
                  Login
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
