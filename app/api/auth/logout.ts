import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth-amplify';

export async function POST() {
  try {
    // Usar a função de logout do AWS Amplify
    await logoutUser();
    
    // Limpar cookies (mantidos por compatibilidade com código existente)
    return NextResponse.json({ success: true }, {
      headers: {
        // Não precisa mais limpar cookies do next-auth
        'Clear-Amplify-Auth': 'true' // Custom header apenas para indicar a ação
      },
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return NextResponse.json({ success: false, error: 'Erro ao fazer logout' }, { status: 500 });
  }
}
