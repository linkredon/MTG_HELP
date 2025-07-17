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
    
    // URLs de redirecionamento com base no ambiente
    // Para produção, usamos o URL do Amplify ou um domínio personalizado se configurado
    const baseUrl = isLocal 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://main.da2h2t88kn6qm.amplifyapp.com';
      
    // Adicionar todos os domínios válidos para redirecionamento
    const productionUrls = [
      'https://main.da2h2t88kn6qm.amplifyapp.com', // URL correta do Amplify
      'https://mtghelper.com',
      'https://www.mtghelper.com'
    ];
    
    const localUrls = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002'
    ];
      
    const redirectSignIn = isLocal
      ? [...localUrls, ...productionUrls]
      : [...productionUrls, ...localUrls];
    
    const redirectSignOut = isLocal
      ? [...localUrls, ...productionUrls]
      : [...productionUrls, ...localUrls];

    // Usar o formato de configuração Amplify v6 (legacy config)
    const config = {
      aws_project_region: region,
      aws_cognito_region: region,
      aws_user_pools_id: userPoolId,
      aws_user_pools_web_client_id: userPoolClientId,
      aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID || 'us-east-2:8681c7d7-6e0e-494f-9f0a-fe9f8d949db5',
      oauth: {
        domain: cognitoDomain,
        scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
        redirectSignIn: redirectSignIn.join(','),
        redirectSignOut: redirectSignOut.join(','),
        responseType: 'code'
      },
      federationTarget: 'COGNITO_USER_POOLS'
    };
    
    // Log de diagnóstico para depuração
    console.log("URLs de redirecionamento:");
    console.log("- SignIn:", redirectSignIn);
    console.log("- SignOut:", redirectSignOut);
    console.log("- URL Base:", baseUrl);
    console.log("- Domínio Cognito:", cognitoDomain);
    
    
    // Log de diagnóstico para depuração
    console.log("URLs de redirecionamento:");
    console.log("- SignIn:", redirectSignIn);
    console.log("- SignOut:", redirectSignOut);
    console.log("- URL Base:", baseUrl);
    console.log("- Domínio Cognito:", cognitoDomain);
    
// Aplicar configuração
    Amplify.configure(config);
    
    console.log('✅ Amplify configurado com sucesso usando formato legacy');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar Amplify:', error);
    
    // Tentar configuração minima
    try {
      Amplify.configure({});
      console.log('⚠️ Usando configuração mínima para evitar erros');
      return true;
    } catch (e) {
      console.error('Falha completa na configuração:', e);
      return false;
    }
  }
}

export default configureAmplify;
