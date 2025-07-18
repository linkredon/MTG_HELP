'use client';

import { Amplify } from 'aws-amplify';

// Verifica o ambiente atual
const isLocal = 
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Configuração otimizada do Amplify
export function configureAmplify() {
  try {
    // Buscar configurações do .env.local
    const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID || 'us-east-2_GIWZQN4d2';
    const userPoolClientId = process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || '55j5l3rcp164av86djhf9qpjch';
    const region = process.env.NEXT_PUBLIC_REGION || 'us-east-2';
    
    // Obter o domínio do Cognito e garantir que tenha https://
    let cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'mtghelper.auth.us-east-2.amazoncognito.com';
    // Garantir que o domínio sempre use https://
    if (!cognitoDomain.startsWith('https://')) {
      cognitoDomain = `https://${cognitoDomain}`;
    }
    
    // URLs de redirecionamento completas para todos os ambientes
    const productionUrls = [
      'https://main.da2h2t88kn6qm.amplifyapp.com',
      'https://mtghelper.com',
      'https://www.mtghelper.com'
    ];
    
    const localUrls = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005'
    ];
      
    // Sempre incluir todas as URLs para garantir compatibilidade
    const redirectSignIn = [...productionUrls, ...localUrls];
    const redirectSignOut = [...productionUrls, ...localUrls];

    const identityPoolId = process.env.NEXT_PUBLIC_IDENTITY_POOL_ID || 'us-east-2:8681c7d7-6e0e-494f-9f0a-fe9f8d949db5';

    // Log de diagnóstico para depuração
    console.log('Configuração final do Amplify:', {
      region,
      userPoolId,
      userPoolClientId,
      cognitoDomain,
      identityPoolId,
      redirectSignIn,
      redirectSignOut
    });

    // Configuração correta para Amplify v6+
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          identityPoolId,
          loginWith: {
            email: true,
            oauth: {
              domain: cognitoDomain.replace('https://', ''),
              scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
              redirectSignIn: redirectSignIn.join(','),
              redirectSignOut: redirectSignOut.join(','),
              responseType: 'code',
              providers: ['Google']
            }
          }
        }
      }
    });
    
    console.log('✅ Amplify configurado com sucesso usando formato v6+');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar Amplify:', error);
    
    // Tentar configuração minima
    try {
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: 'us-east-2_GIWZQN4d2',
            userPoolClientId: '55j5l3rcp164av86djhf9qpjch'
          }
        }
      });
      console.log('⚠️ Usando configuração mínima para evitar erros');
      return true;
    } catch (e) {
      console.error('Falha completa na configuração:', e);
      return false;
    }
  }
}

export default configureAmplify;
