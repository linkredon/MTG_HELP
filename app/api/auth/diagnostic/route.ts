import { NextRequest, NextResponse } from 'next/server';
import { authOptions, fallbackAuthOptions } from './auth-barrel';

// Este endpoint fornece informações de diagnóstico sobre a configuração do NextAuth
// ATENÇÃO: Use apenas em ambiente de desenvolvimento!
export async function GET(request: NextRequest) {
  // Verificar se estamos em ambiente de produção
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Este endpoint está disponível apenas em ambiente de desenvolvimento' 
    }, { status: 403 });
  }

  try {
    // Coletar informações de diagnóstico
    const diagnosticInfo = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
        hasAwsCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
      },
      authConfig: {
        providers: authOptions.providers.map(p => p.id),
        pages: authOptions.pages,
        hasSecret: !!authOptions.secret,
        sessionStrategy: authOptions.session?.strategy,
        callbacksConfigured: {
          jwt: !!authOptions.callbacks?.jwt,
          session: !!authOptions.callbacks?.session,
          signIn: !!authOptions.callbacks?.signIn
        }
      },
      fallbackConfig: {
        providers: fallbackAuthOptions.providers.map(p => p.id),
        hasSecret: !!fallbackAuthOptions.secret
      },
      // Timestamp para verificar atualização
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(diagnosticInfo);
  } catch (error) {
    console.error('Erro ao gerar diagnóstico:', error);
    return NextResponse.json({ 
      error: 'Ocorreu um erro ao gerar o diagnóstico',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
