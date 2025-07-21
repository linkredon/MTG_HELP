"use client";

import { useState, useEffect } from 'react';
import { validateAuthConfiguration } from '@/lib/authDiagnostic';

/**
 * Componente que analisa e tenta corrigir problemas comuns de autenticação OAuth
 */
export default function AuthTroubleshooter() {
  const [problems, setProblems] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isFixed, setIsFixed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Analisar problemas de autenticação
  const analyzeAuthProblems = async () => {
    setIsAnalyzing(true);
    
    try {
      // Verificar configuração do Amplify
      const validation = validateAuthConfiguration();
      
      if (!validation.isValid) {
        setProblems(validation.issues);
        setWarnings(validation.warnings);
      } else {
        setProblems([]);
        setWarnings(validation.warnings);
      }
      
      // Verificar problemas adicionais
      const additionalProblems: string[] = [];
      
      // Verificar cookies
      if (!navigator.cookieEnabled) {
        additionalProblems.push('Os cookies estão desativados no seu navegador. O login OAuth requer cookies.');
      }
      
      // Verificar localStorage
      try {
        const testKey = '_auth_test_';
        localStorage.setItem(testKey, 'test');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (retrieved !== 'test') {
          additionalProblems.push('Seu navegador tem problemas com localStorage. O Amplify requer localStorage para funcionar.');
        }
      } catch (e) {
        additionalProblems.push('Seu navegador bloqueou o acesso ao localStorage. O Amplify requer localStorage para funcionar.');
      }
      
      // Verificar se está em modo incógnito/privado
      const isIncognito = !window.indexedDB;
      if (isIncognito) {
        additionalProblems.push('Você parece estar navegando em modo anônimo/incógnito, o que pode interferir com a autenticação.');
      }
      
      // Adicionar à lista de problemas
      if (additionalProblems.length > 0) {
        setProblems(prev => [...prev, ...additionalProblems]);
      }
    } catch (error) {
      console.error('Erro ao analisar problemas de autenticação:', error);
      setProblems(prev => [...prev, `Erro ao analisar: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Tentar corrigir problemas automaticamente
  const attemptFix = async () => {
    let fixed = false;
    
    try {
      // Limpar cookies relacionados à autenticação
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name && (
          name.includes('amplify') || 
          name.includes('next-auth') || 
          name.includes('cognito')
        )) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          fixed = true;
        }
      });
      
      // Limpar localStorage relacionado à autenticação
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('amplify') || 
          key.includes('CognitoIdentity') || 
          key.includes('token') || 
          key.includes('oauth') ||
          key.includes('aws')
        )) {
          localStorage.removeItem(key);
          fixed = true;
        }
      }
      
      if (fixed) {
        setIsFixed(true);
        // Reduzir a lista de problemas
        setProblems(prev => prev.filter(p => 
          !p.includes('cookie') && !p.includes('storage') && !p.includes('sessão')
        ));
      }
    } catch (error) {
      console.error('Erro ao tentar corrigir problemas:', error);
    }
    
    return fixed;
  };
  
  // Executar análise automática na inicialização
  useEffect(() => {
    analyzeAuthProblems();
  }, []);

  // Se não houver problemas, não mostrar nada
  if (problems.length === 0 && warnings.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            {problems.length > 0 
              ? 'Problemas de autenticação detectados' 
              : 'Alertas de autenticação'}
          </h3>
          
          {problems.length > 0 && (
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                {problems.map((problem, index) => (
                  <li key={index}>{problem}</li>
                ))}
              </ul>
            </div>
          )}
          
          {warnings.length > 0 && (
            <div className="mt-2 text-sm text-yellow-700">
              <p className="font-medium">Alertas:</p>
              <ul className="list-disc pl-5 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4">
            {!isFixed && (
              <button
                onClick={attemptFix}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded mr-2"
                disabled={isAnalyzing}
              >
                Tentar corrigir automaticamente
              </button>
            )}
            
            <button
              onClick={analyzeAuthProblems}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analisando...' : 'Verificar novamente'}
            </button>
            
            {isFixed && (
              <p className="text-green-600 mt-2">
                🔧 Foram feitas tentativas de correção. Tente fazer login novamente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
