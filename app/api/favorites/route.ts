import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthSession } from '@/lib/auth-adapter';

// GET /api/favorites - Listar favoritos do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authSession = await fetchAuthSession();
    if (!authSession?.tokens?.idToken) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair ID do usuário do token
    const userId = authSession.tokens.idToken.payload.sub;

    // Por enquanto, retornar array vazio para evitar problemas
    // TODO: Implementar busca no banco de dados quando as credenciais AWS estiverem funcionando
    return NextResponse.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    // Retornar resposta de erro em JSON válido
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor', data: [] },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Adicionar favorito
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authSession = await fetchAuthSession();
    if (!authSession?.tokens?.idToken) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Extrair dados do corpo da requisição
    const { card } = await request.json();
    
    if (!card || !card.id) {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Extrair ID do usuário do token
    const userId = authSession.tokens.idToken.payload.sub;

    // Por enquanto, retornar sucesso para evitar problemas
    // TODO: Implementar salvamento no banco de dados quando as credenciais AWS estiverem funcionando
    return NextResponse.json({
      success: true,
      data: { card }
    });

  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    // Retornar resposta de erro em JSON válido
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 