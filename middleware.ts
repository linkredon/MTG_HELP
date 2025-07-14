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
  '/auth-monitor' // Adicionada rota do monitor de autenticação
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
  let response = NextResponse.next();
  
  // Diagnosticar fluxo de autenticação em todas as requisições
  // para capturar callbacks OAuth mesmo em rotas públicas
  const authDiagResponse = diagnoseAuthFlow(request, response);
  if (authDiagResponse !== response) {
    return authDiagResponse; // Retornar resposta modificada pelo diagnóstico (ex: redirecionamento)
  }
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route) || 
    request.nextUrl.pathname === '/'
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

    // Se não tiver token, redirecionar para login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificação de permissão para rotas administrativas
    if (request.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Usuário autenticado, permitir acesso
    return response;
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
    '/user/:path*',
    '/admin/:path*',
    '/api/((?!auth|register).)*', // Todas as rotas API exceto auth e register
    // Rotas específicas para autenticação
    '/auth-monitor',
    '/login',
    '/api/auth/:path*'
  ],
};
