import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * API para analisar informações de autenticação
 * Útil para depurar problemas de login OAuth
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar token do Amplify
    const amplifyTokens = request.cookies.get('amplify.auth.tokens')?.value;
    const hasAmplifyAuth = !!amplifyTokens || !!request.cookies.get('amplify-signin-with-hostedUI')?.value;
    
    // Extrair informações básicas do token
    let token: any = null;
    if (amplifyTokens) {
      try {
        const tokensObj = JSON.parse(amplifyTokens);
        if (tokensObj.idToken?.payload) {
          token = {
            email: tokensObj.idToken.payload.email,
            name: tokensObj.idToken.payload.name || tokensObj.username,
            sub: tokensObj.idToken.payload.sub
          };
        }
      } catch (e) {
        console.error('Erro ao analisar token Amplify:', e);
      }
    }
    
    // Analisar cookies
    const cookies: Record<string, string> = {};
    request.cookies.getAll().forEach(cookie => {
      if (
        cookie.name.includes('next-auth') ||
        cookie.name.includes('__Secure') ||
        cookie.name.includes('amplify') ||
        cookie.name.includes('cognito') ||
        cookie.name.includes('token')
      ) {
        // Reduzir tamanho para não expor informação sensível
        const value = cookie.value.length > 20 
          ? `${cookie.value.substring(0, 20)}...` 
          : cookie.value;
        cookies[cookie.name] = value;
      }
    });
    
    // Extrair parâmetros de URL
    const searchParams: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      searchParams[key] = value;
    });
    
    // Informações sobre o usuário (reduzidas para segurança)
    const user = token ? {
      email: token.email || 'não disponível',
      name: token.name || 'não disponível',
      isLoggedIn: true
    } : null;

    // Resultado final com informações de diagnóstico
    const result = {
      isAuthenticated: !!token,
      authMethod: token ? 'amplify' : 'none',
      user,
      hasCookies: Object.keys(cookies).length > 0,
      authCookies: cookies,
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : null,
      clientInfo: {
        userAgent: request.headers.get('user-agent') || 'unknown',
        referer: request.headers.get('referer') || 'none'
      }
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API de diagnóstico de autenticação:', error);
    
    return NextResponse.json({ 
      error: 'Erro ao analisar autenticação',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      isAuthenticated: false
    }, { status: 500 });
  }
}
