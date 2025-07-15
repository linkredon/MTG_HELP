import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '../../../../lib/authOptions';
import type { User } from '@/types/user';

export async function GET(req: NextRequest) {
  // Verificar ambiente
  const isProd = process.env.NODE_ENV === 'production';
  
  // Tentar obter a sessão do servidor
  const session = await getServerSession(authOptions);
  
  // Verificar cookies de autenticação do Amplify
  const amplifyAuth = req.cookies.get('amplify-signin-with-hostedUI')?.value;
  const amplifyTokens = req.cookies.get('amplify.auth.tokens')?.value;
  
  // Se temos tokens do Amplify mas não sessão NextAuth, podemos considerar autenticado
  if ((amplifyAuth || amplifyTokens) && (!session || !session.user)) {
    // Em produção não exibimos logs detalhados
    if (!isProd) console.log('API ME: Autenticação Amplify detectada sem sessão NextAuth');
    
    // Extrair nome de usuário do token, se possível
    let username = 'Usuário Amplify';
    try {
      if (amplifyTokens) {
        const tokensObj = JSON.parse(amplifyTokens);
        if (tokensObj.username) {
          username = tokensObj.username;
        }
      }
    } catch (e) {
      if (!isProd) console.error('Erro ao analisar token Amplify:', e);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        name: username,
        email: 'usuario@mtghelper.com', // Email genérico para usuário Amplify
        nickname: username,
        avatar: '/default-avatar.png',
        bio: '',
        theme: 'dark',
        collectionsCount: 0,
        totalCards: 0,
        role: 'user',
        isAmplifyAuth: true
      }
    });
  }
  
  // MODO DE EMERGÊNCIA: Se não tiver sessão, criar uma sessão demo
  // Em produção, limitamos o uso de modo de emergência
  if (!session || !session.user) {
    if (!isProd) console.log('API ME: Sessão não encontrada, criando sessão de emergência');
    
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
  const userData: User = {
    name: session.user.name || (session.user.email ? session.user.email.split('@')[0] : 'Usuário'),
    email: session.user.email || '',
    nickname: session.user.nickname || '',
    avatar: session.user.avatar || '/default-avatar.png',
    bio: session.user.bio || '',
    theme: session.user.theme || 'dark',
    collectionsCount: session.user.collectionsCount || 0,
    totalCards: session.user.totalCards || 0,
    role: session.user.role || 'user'
  };

  return NextResponse.json({
    success: true,
    user: userData
  });
}
