"use client";

import React, { useState, useEffect } from 'react';
import { useAmplifyAuth } from '@/contexts/AmplifyAuthContext';
import { fetchAuthSession, getCurrentUser } from '@/lib/aws-auth-adapter';

const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAmplifyAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  const checkAuthStatus = async () => {
    try {
      // Verificar sessão
      const session = await fetchAuthSession();
      const currentUser = await getCurrentUser();
      
      // Verificar cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      setDebugInfo({
        session: {
          hasTokens: !!session.tokens,
          hasIdToken: !!session.tokens?.idToken,
          hasAccessToken: !!session.tokens?.accessToken,
        },
        currentUser: {
          exists: !!currentUser,
          username: currentUser?.username,
          attributes: currentUser?.attributes,
        },
        cookies: {
          amplifyTokens: !!cookies['amplify.auth.tokens'],
          amplifySignIn: !!cookies['amplify-signin-with-hostedUI'],
          mtgUserAuthenticated: !!cookies['mtg_user_authenticated'],
        },
        context: {
          isAuthenticated,
          isLoading,
          hasUser: !!user,
          userInfo: user,
        }
      });
    } catch (error) {
      setDebugInfo({ error: error.message });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [isAuthenticated, user]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-300">Debug de Autenticação</h4>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Status do Contexto:</strong>
          <div className="ml-2">
            <div>Autenticado: {isAuthenticated ? '✅' : '❌'}</div>
            <div>Carregando: {isLoading ? '✅' : '❌'}</div>
            <div>Usuário: {user ? '✅' : '❌'}</div>
          </div>
        </div>
        
        <div>
          <strong>Cookies:</strong>
          <div className="ml-2">
            <div>Amplify Tokens: {debugInfo.cookies?.amplifyTokens ? '✅' : '❌'}</div>
            <div>Amplify SignIn: {debugInfo.cookies?.amplifySignIn ? '✅' : '❌'}</div>
            <div>MTG User Auth: {debugInfo.cookies?.mtgUserAuthenticated ? '✅' : '❌'}</div>
          </div>
        </div>
        
        <div>
          <strong>Sessão:</strong>
          <div className="ml-2">
            <div>Tokens: {debugInfo.session?.hasTokens ? '✅' : '❌'}</div>
            <div>ID Token: {debugInfo.session?.hasIdToken ? '✅' : '❌'}</div>
            <div>Access Token: {debugInfo.session?.hasAccessToken ? '✅' : '❌'}</div>
          </div>
        </div>
        
        <div>
          <strong>Usuário Atual:</strong>
          <div className="ml-2">
            <div>Existe: {debugInfo.currentUser?.exists ? '✅' : '❌'}</div>
            <div>Username: {debugInfo.currentUser?.username || 'N/A'}</div>
          </div>
        </div>
        
        {debugInfo.error && (
          <div className="text-red-400">
            <strong>Erro:</strong> {debugInfo.error}
          </div>
        )}
      </div>
      
      <button
        onClick={checkAuthStatus}
        className="mt-3 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
      >
        Atualizar Debug
      </button>
    </div>
  );
};

export default AuthDebugger;
