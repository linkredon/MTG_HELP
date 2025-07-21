import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthSession } from '@/lib/auth-adapter';

// GET /api/favorites/card/[cardId] - Verificar se carta é favorita
export async function GET(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    // Verificar autenticação
    const authSession = await fetchAuthSession();
    if (!authSession?.tokens?.idToken) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { cardId } = params;
    
    if (!cardId) {
      return NextResponse.json(
        { success: false, message: 'ID da carta não fornecido' },
        { status: 400 }
      );
    }

    // Extrair ID do usuário do token
    const userId = authSession.tokens.idToken.payload.sub;

    // TODO: Implementar verificação no banco de dados
    // Por enquanto, retornar false
    return NextResponse.json({
      success: true,
      data: { isFavorite: false }
    });

  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites/card/[cardId] - Remover favorito por ID da carta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    // Verificar autenticação
    const authSession = await fetchAuthSession();
    if (!authSession?.tokens?.idToken) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { cardId } = params;
    
    if (!cardId) {
      return NextResponse.json(
        { success: false, message: 'ID da carta não fornecido' },
        { status: 400 }
      );
    }

    // Extrair ID do usuário do token
    const userId = authSession.tokens.idToken.payload.sub;

    // TODO: Implementar remoção no banco de dados
    // Por enquanto, retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Favorito removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 