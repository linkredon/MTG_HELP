'use client';

import React, { useState, useEffect } from 'react';

export default function RedirectUriChecker() {
  const [googleUris, setGoogleUris] = useState<string[]>([
    'https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/idpresp',
    'https://mtghelper.auth.us-east-2.amazoncognito.com/logout',
    'http://localhost:3000/api/auth/callback/google',
    'https://main.da2ht88kn6qm.amplifyapp.com/api/auth/callback/google'
  ]);
  
  const [cognitoUris, setCognitoUris] = useState<string[]>([
    'http://localhost:3000/',
    'https://main.da2h2t88kn6qm.amplifyapp.com/'
  ]);
  
  const [problems, setProblems] = useState<string[]>([]);
  
  useEffect(() => {
    // Verificar problemas comuns com URIs de redirecionamento
    const detectedProblems: string[] = [];
    
    // Verificar se o URI específico do Cognito existe no Google
    if (!googleUris.some(uri => uri.includes('/oauth2/idpresp'))) {
      detectedProblems.push('O URI específico do Cognito (que termina com /oauth2/idpresp) não está configurado no Google.');
    }
    
    // Verificar diferenças de domínio entre Google e Cognito
    const googleDomains = googleUris
      .map(uri => {
        try {
          return new URL(uri).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    
    const cognitoDomains = cognitoUris
      .map(uri => {
        try {
          return new URL(uri).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    
    // Verificar domínios no Cognito que não estão no Google
    cognitoDomains.forEach(domain => {
      if (domain && !googleDomains.includes(domain)) {
        detectedProblems.push(`O domínio "${domain}" está configurado no Cognito mas não no Google.`);
      }
    });
    
    // Verificar se o localhost está configurado em ambos para desenvolvimento
    if (!googleDomains.includes('localhost') || !cognitoDomains.includes('localhost')) {
      detectedProblems.push('O domínio "localhost" deve estar configurado tanto no Google quanto no Cognito para desenvolvimento local.');
    }
    
    // Verificar formatação comum dos URIs no Google
    googleUris.forEach(uri => {
      if (uri.includes('localhost') && !uri.includes(':3000')) {
        detectedProblems.push(`O URI "${uri}" pode estar faltando a porta :3000 para localhost.`);
      }
    });
    
    setProblems(detectedProblems);
  }, [googleUris, cognitoUris]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Verificador de URIs de Redirecionamento</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div>
          <h3 className="font-medium mb-2">URIs no Google Cloud Console</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {googleUris.map((uri, index) => (
              <li key={`google-${index}`} className="break-all">
                <code className="bg-gray-100 px-1 rounded">{uri}</code>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-gray-500">
            Configurados em: Google Cloud Console &gt; APIs & Services &gt; Credentials &gt; OAuth 2.0 Client IDs
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">URIs no AWS Cognito</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {cognitoUris.map((uri, index) => (
              <li key={`cognito-${index}`} className="break-all">
                <code className="bg-gray-100 px-1 rounded">{uri}</code>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-gray-500">
            Configurados em: AWS Console &gt; Cognito &gt; User Pools &gt; App integration &gt; App client settings
          </div>
        </div>
      </div>
      
      {problems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <h3 className="font-medium text-yellow-800 mb-1">Possíveis problemas detectados:</h3>
          <ul className="list-disc pl-5 space-y-1 text-yellow-700">
            {problems.map((problem, index) => (
              <li key={index}>{problem}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-medium text-blue-800 mb-2">Requisitos importantes para URIs de redirecionamento</h3>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
          <li>O URI <code>https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/idpresponse</code> <strong>deve</strong> estar configurado no Google Cloud Console.</li>
          <li>Todos os domínios em que sua aplicação estará hospedada (como localhost e seu domínio de produção) devem estar configurados em ambos os lugares.</li>
          <li>URIs no Google geralmente são mais específicos (incluem o caminho completo).</li>
          <li>URIs no Cognito podem ser mais gerais (apenas o domínio raiz).</li>
          <li>O Google é sensível à formatação exata, incluindo a barra no final das URLs.</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Próximos passos:</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Verifique se o URI <code>https://mtghelper.auth.us-east-2.amazoncognito.com/oauth2/idpresponse</code> está configurado no Google Cloud Console.</li>
          <li>Certifique-se de que todos os domínios estejam configurados em ambos os lugares.</li>
          <li>Após fazer alterações, salve as configurações e reinicie o servidor.</li>
        </ol>
      </div>
    </div>
  );
}
