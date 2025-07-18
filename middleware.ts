import { NextRequest, NextResponse } from 'next/server';

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/login', 
  '/register', 
  '/reset-password', 
  '/confirm-code',
  '/api/auth',
  '/api/register',
  '/api/favorites', // Adicionar rotas de favoritos
  '/api/collections', // Adicionar rotas de coleções
  '/api/decks', // Adicionar rotas de decks
  '/api/users', // Adicionar rotas de usuários
  '/_next',
  '/favicon.ico',
  '/auth-monitor', // Adicionada rota do monitor de autenticação
  '/api/auth/session', // Garantir que a rota da sessão seja pública (mantido para compatibilidade)
  '/scripts', // Permitir acesso a scripts estáticos
  '/images', // Permitir acesso a imagens estáticas
  '/fonts', // Permitir acesso a fontes
  '/styles' // Permitir acesso a estilos CSS
  // '/': Removida a página inicial das rotas públicas, agora requer autenticação
];

// Função para diagnosticar fluxo de autenticação
function diagnoseAuthFlow(request: NextRequest, response: NextResponse) {
  try {
    // Extrair parâmetros de URL relevantes
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Verificar se há parâmetros de autenticação relevantes
    if (code || state || error || errorDescription || 
        searchParams.has('id_token') || 
        searchParams.has('access_token') ||
        request.nextUrl.hash?.includes('id_token') || 
        request.nextUrl.hash?.includes('access_token')) {
      
      console.log('🔍 [Auth Middleware] Detectados parâmetros de autenticação:');
      
      // Detalhes de diagnóstico
      if (code) console.log('- Código de autorização recebido');
      if (state) console.log('- Estado de autenticação:', state);
      if (error) console.log('- Erro de autenticação:', error);
      if (errorDescription) console.log('- Descrição do erro:', errorDescription);
      
      // Obter cabeçalhos relevantes
      const referer = request.headers.get('referer');
      if (referer) console.log('- Referência:', referer);
      
      // Sinalizar que um fluxo de autenticação está em andamento
      const redirectUrl = request.nextUrl.clone();
      response = NextResponse.redirect(redirectUrl);
      response.cookies.set('mtg_auth_in_progress', 'true', { 
        maxAge: 60, // Cookie de curta duração para evitar loops
        path: '/'
      });
      
      return response;
    }
  } catch (error) {
    console.error('Erro ao diagnosticar fluxo de autenticação:', error);
  }
  
  return response;
}

// Middleware principal
export async function middleware(request: NextRequest) {
  // Iniciar com a resposta padrão (continuar a navegação)
  let response = NextResponse.next();
  
  // Diagnóstico de parâmetros de autenticação
  response = diagnoseAuthFlow(request, response);
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Permitir acesso a rotas públicas sem verificação
  if (isPublicRoute) {
    console.log(`[Middleware] Permitindo acesso a rota pública: ${request.nextUrl.pathname}`);
    return response;
  }

  // Verificar se estamos em modo de demonstração
  const isDemoMode = request.cookies.get('NEXT_PUBLIC_DEMO_MODE')?.value === 'true';
  if (isDemoMode) {
    console.log(`[Middleware] Modo demo ativo, permitindo acesso a: ${request.nextUrl.pathname}`);
    return response;
  }

  // Verificar cookies do Amplify para determinar autenticação
  const amplifyTokensCookie = request.cookies.has('amplify.auth.tokens');
  const amplifyAuthCookie = request.cookies.get('amplify-signin-with-hostedUI');
  
  // Verificar também cookie temporário que podemos usar para evitar loops
  const justLoggedIn = request.cookies.get('mtg_auth_in_progress')?.value === 'true';
  
  // Verificar o novo cookie de autenticação
  const userAuthenticated = request.cookies.get('mtg_user_authenticated')?.value === 'true';
  
  // Verificar se há um fluxo de autenticação em andamento
  const isPotentiallyAuthenticated = amplifyTokensCookie || !!amplifyAuthCookie || justLoggedIn || userAuthenticated;
  
  // Para rotas de usuário, ser mais permissivo para evitar loops
  const isUserRoute = request.nextUrl.pathname.startsWith('/user');
  
  // Se for uma rota de usuário e há qualquer indicativo de autenticação, permitir
  if (isUserRoute && isPotentiallyAuthenticated) {
    console.log(`[Middleware] Permitindo acesso a rota de usuário: ${request.nextUrl.pathname}`);
    return response;
  }
  
  // Para a página inicial (/), ser mais permissivo se há qualquer indicativo de autenticação
  if (request.nextUrl.pathname === '/' && isPotentiallyAuthenticated) {
    console.log(`[Middleware] Permitindo acesso à página inicial com potencial autenticação`);
    return response;
  }
  
  // Se não tiver nenhum indício de autenticação, redirecionar para login
  if (!isPotentiallyAuthenticated) {
    console.log(`[Middleware] Redirecionando usuário não autenticado de ${request.nextUrl.pathname} para /login`);
    
    // Construir URL de redirecionamento, preservando a URL original como callbackUrl
    const redirectUrl = new URL('/login', request.url);
    
    // Armazenar a URL de destino original para redirecionamento após login
    if (request.url !== request.nextUrl.origin + '/login') {
      redirectUrl.searchParams.set('callbackUrl', request.url);
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  console.log(`[Middleware] Permitindo acesso autenticado a: ${request.nextUrl.pathname}`);
  return response;
}

// Configurar o middleware para ser executado em todas as rotas
export const config = {
  matcher: [
    /*
     * Corresponder a todas as rotas exceto:
     * 1. /api/auth/* (rotas de autenticação da API)
     * 2. /_next/* (arquivos internos do Next.js)
     * 3. /fonts/* (arquivos estáticos)
     * 4. /images/* (arquivos estáticos)
     * 5. /scripts/* (arquivos estáticos)
     * 6. /styles/* (arquivos estáticos)
     * 7. /favicon.ico, /sitemap.xml, /robots.txt
     */
    '/((?!api/auth|_next|fonts|images|scripts|styles|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
