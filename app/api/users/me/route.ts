import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/types/user';

export async function GET(req: NextRequest) {
  // Verificar ambiente
  const isProd = process.env.NODE_ENV === 'production';
  
  // Verificar cookies de autenticação do Amplify
  const amplifyAuth = req.cookies.get('amplify-signin-with-hostedUI')?.value;
  const amplifyTokens = req.cookies.get('amplify.auth.tokens')?.value;
  
  // Se temos tokens do Amplify, podemos considerar autenticado
  if (amplifyAuth || amplifyTokens) {
    // Em produção não exibimos logs detalhados
    if (!isProd) console.log('API ME: Autenticação Amplify detectada');
    
    // Extrair nome de usuário do token, se possível
    let username = 'Usuário Amplify';
    let email = 'usuario@mtghelper.com';
    let role = 'user';
    
    try {
      if (amplifyTokens) {
        const tokensObj = JSON.parse(amplifyTokens);
        if (tokensObj.username) {
          username = tokensObj.username;
        }
        
        // Tentar extrair mais informações se disponíveis
        if (tokensObj.idToken?.payload) {
          if (tokensObj.idToken.payload.email) {
            email = tokensObj.idToken.payload.email;
          }
          if (tokensObj.idToken.payload['custom:role']) {
            role = tokensObj.idToken.payload['custom:role'];
          }
        }
      }
    } catch (e) {
      if (!isProd) console.error('Erro ao analisar token Amplify:', e);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        name: username,
        email: email,
        nickname: username,
        avatar: '/default-avatar.png',
        bio: '',
        theme: 'dark',
        collectionsCount: 0,
        totalCards: 0,
        role: role,
        isAmplifyAuth: true
      }
    });
  }
  
  // MODO DE EMERGÊNCIA: Se não tiver autenticação, criar uma sessão demo
  // Em produção, limitamos o uso de modo de emergência
  if (!isProd) console.log('API ME: Autenticação não encontrada, criando sessão de emergência');
    
  // Verificar modo de demonstração nos cookies
  const demoMode = req.cookies.get('NEXT_PUBLIC_DEMO_MODE')?.value === 'true';
  
  // Retornar usuário de emergência para evitar loops de redirecionamento
  // Em produção, este usuário terá menos privilégios
  return NextResponse.json({
    success: true,
    user: {
      name: isProd ? 'Visitante' : 'Usuário Temporário',
      email: 'usuario@temporario.com',
      nickname: isProd ? 'Visitante' : 'Temp',
      avatar: '/default-avatar.png',
      bio: isProd ? 'Faça login para personalizar seu perfil.' : 'Este é um perfil temporário para diagnóstico.',
      theme: 'dark',
      collectionsCount: 0,
      totalCards: 0,
      role: 'user',
      isTemporary: true,
      demoMode: demoMode,
      isProd: isProd
    }
  });
}
