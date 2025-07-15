import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/login', 
  '/register', 
  '/reset-password', 
  '/confirm-code',
  '/api/auth',
  '/api/register',
  '/_next',
  '/favicon.ico',
  '/auth-monitor', // Adicionada rota do monitor de autenticação
  '/api/auth/session', // Garantir que a rota da sessão seja pública
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
      
      const userAgent = request.headers.get('user-agent');
      if (userAgent) console.log('- User Agent:', userAgent);
      
      // Adicionar cabeçalhos de diagnóstico
      response.headers.set('X-Auth-Flow-Detected', 'true');
      if (code) response.headers.set('X-Auth-Code-Received', 'true');
      if (error) response.headers.set('X-Auth-Error-Detected', 'true');
      
      // Se encontrarmos um código de autenticação na raiz, redirecionar para o monitor
      // Isso ajuda a capturar e analisar o fluxo OAuth quando o redirecionamento é para a raiz
      if ((code || error) && request.nextUrl.pathname === '/') {
        console.log('🔄 Redirecionando para o monitor de autenticação para análise detalhada');
        
        // Construir URL com todos os parâmetros
        const monitorUrl = new URL('/auth-monitor', request.url);
        searchParams.forEach((value, key) => {
          monitorUrl.searchParams.set(key, value);
        });
        
        return NextResponse.redirect(monitorUrl);
      }
    }
  } catch (error) {
    console.error('Erro no diagnóstico de autenticação:', error);
  }
  
  return response;
}

// Middleware para verificar autenticação
export async function middleware(request: NextRequest) {
  // Verificar ambiente para habilitar ou não o bypass
  const isProd = process.env.NODE_ENV === 'production';
  
  // Em produção, removemos os logs de depuração e configuramos com mais segurança
  if (request.nextUrl.pathname.startsWith('/user')) {
    if (!isProd) console.log('BYPASS: Permitindo acesso a rota de usuário');
    return NextResponse.next();
  }
  
  let response = NextResponse.next();
  
  // Diagnosticar fluxo de autenticação em todas as requisições
  // para capturar callbacks OAuth mesmo em rotas públicas
  const authDiagResponse = diagnoseAuthFlow(request, response);
  if (authDiagResponse !== response) {
    return authDiagResponse; // Retornar resposta modificada pelo diagnóstico (ex: redirecionamento)
  }
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Permitir acesso a rotas públicas sem verificação
  if (isPublicRoute) {
    return response;
  }

  // Verificar se estamos em modo de demonstração
  const isDemoMode = request.cookies.get('NEXT_PUBLIC_DEMO_MODE')?.value === 'true';
  if (isDemoMode) {
    return response;
  }

  // Verificar token de autenticação
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // Verificar se há cookie de sessão do Amplify (indicativo de login recente)
    const amplifyAuthCookie = request.cookies.get('amplify-signin-with-hostedUI');
    const amplifyTokensCookie = request.cookies.has('amplify.auth.tokens');
    const nextAuthSessionCookie = request.cookies.has('next-auth.session-token') || request.cookies.has('__Secure-next-auth.session-token');
    const csrfStateCookie = request.cookies.has('next-auth.csrf-token');
    
    // Verificação mais ampla de possíveis indicativos de autenticação
    const hasPotentialAmplifyAuth = !!amplifyAuthCookie || amplifyTokensCookie;
    const hasPotentialNextAuth = nextAuthSessionCookie || csrfStateCookie;
    
    // Verificar também cookie temporário que podemos usar para evitar loops
    const justLoggedIn = request.cookies.get('mtg_auth_in_progress')?.value === 'true';
    
    // Verificar se há um fluxo de autenticação em andamento (token, cookies ou sessão recente)
    const isPotentiallyAuthenticated = token || hasPotentialAmplifyAuth || hasPotentialNextAuth || justLoggedIn;
    
    // Para rotas de usuário, ser mais permissivo para evitar loops
    const isUserRoute = request.nextUrl.pathname.startsWith('/user');
    
    // Se for uma rota de usuário e há qualquer indicativo de autenticação, permitir
    if (isUserRoute && isPotentiallyAuthenticated) {
      console.log('Permitindo acesso a rota de usuário com potencial autenticação');
      return response;
    }
    
    // Se não tiver nenhum indício de autenticação, redirecionar para login
    if (!isPotentiallyAuthenticated) {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) console.log('Sem indícios de autenticação, redirecionando para login');
      
      const loginUrl = new URL('/login', request.url);
      // Salvar a URL completa para redirecionamento após login
      const redirectPath = request.nextUrl.pathname;
      const redirectQuery = request.nextUrl.search;
      const fullRedirectPath = redirectPath + (redirectQuery || '');
      loginUrl.searchParams.set('redirect', fullRedirectPath);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verificação de permissão para rotas administrativas (apenas com token válido)
    if (request.nextUrl.pathname.startsWith('/admin') && (!token || token.role !== 'admin')) {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) console.log('Acesso a área admin negado - redirecionando para home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Usuário com algum tipo de autenticação, permitir acesso
    return response;
    
    // Fallback: redirecionar para login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    
    // Em caso de erro, redirecionar para login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configurar em quais caminhos o middleware deve ser executado
export const config = {
  matcher: [
    // Incluir a raiz para capturar callbacks OAuth
    '/',
    // Rotas que requerem autenticação
    '/colecao/:path*',
    '/deck-builder/:path*',
    // '/user/:path*', -- Removido para evitar loops de redirecionamento
    '/admin/:path*',
    '/api/((?!auth|register|users/me).)*', // Todas as rotas API exceto auth, register e users/me
    // Rotas específicas para autenticação
    '/auth-monitor',
    '/login',
    '/api/auth/:path*'
  ],
};
