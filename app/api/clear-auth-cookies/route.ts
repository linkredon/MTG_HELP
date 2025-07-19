import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 [API] Limpando cookies de autenticação...');
    
    // Criar resposta
    const response = NextResponse.json({ 
      success: true, 
      message: 'Cookies de autenticação limpos com sucesso' 
    });
    
    // Limpar todos os cookies relacionados à autenticação
    response.cookies.delete('amplify.auth.tokens');
    response.cookies.delete('amplify-signin-with-hostedUI');
    response.cookies.delete('mtg_user_authenticated');
    response.cookies.delete('mtg_auth_in_progress');
    response.cookies.delete('amplify.auth.tokens');
    response.cookies.delete('amplify.auth.credentials');
    response.cookies.delete('amplify.auth.identityId');
    response.cookies.delete('amplify.auth.userSub');
    
    // Limpar cookies do Cognito se existirem
    response.cookies.delete('AWSELBAuthSessionCookie');
    response.cookies.delete('AWSELBAuthSessionCookie-0');
    
    console.log('✅ [API] Cookies de autenticação limpos');
    
    return response;
  } catch (error) {
    console.error('❌ [API] Erro ao limpar cookies:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao limpar cookies' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Verificando cookies de autenticação...');
    
    const cookies = request.cookies;
    const authCookies = {
      amplifyTokens: cookies.has('amplify.auth.tokens'),
      amplifyAuth: cookies.has('amplify-signin-with-hostedUI'),
      mtgUserAuthenticated: cookies.get('mtg_user_authenticated')?.value,
      mtgAuthInProgress: cookies.get('mtg_auth_in_progress')?.value,
      amplifyCredentials: cookies.has('amplify.auth.credentials'),
      amplifyIdentityId: cookies.has('amplify.auth.identityId'),
      amplifyUserSub: cookies.has('amplify.auth.userSub'),
      awsElbAuth: cookies.has('AWSELBAuthSessionCookie'),
      awsElbAuth0: cookies.has('AWSELBAuthSessionCookie-0')
    };
    
    console.log('📊 [API] Status dos cookies:', authCookies);
    
    return NextResponse.json({
      success: true,
      cookies: authCookies,
      message: 'Status dos cookies verificado'
    });
  } catch (error) {
    console.error('❌ [API] Erro ao verificar cookies:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao verificar cookies' },
      { status: 500 }
    );
  }
} 