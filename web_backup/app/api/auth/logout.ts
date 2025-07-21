import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Criar resposta com cookies limpos
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout realizado com sucesso' 
    });

    // Limpar cookies do Amplify
    response.cookies.delete('amplify-signin-with-hostedUI');
    response.cookies.delete('amplify.auth.tokens');
    response.cookies.delete('amplify-signin-with-hostedUI-token');
    response.cookies.delete('amplify-signin-with-hostedUI-refreshToken');
    response.cookies.delete('amplify-signin-with-hostedUI-accessToken');
    response.cookies.delete('amplify-signin-with-hostedUI-idToken');
    
    // Limpar outros cookies de autenticação que possam existir
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('next-auth.callback-url');
    
    return response;
  } catch (error) {
    console.error('Erro durante logout:', error);
    return NextResponse.json(
      { success: false, message: 'Erro durante logout' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    message: 'Use POST para fazer logout' 
  }, { status: 405 });
}
