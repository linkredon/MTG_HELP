import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, avatar } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Preparar dados para atualização
    const updates = {
      name: name,
      email: email,
      avatar: avatar,
      updatedAt: new Date().toISOString()
    };

    // Simular sucesso (dados serão salvos localmente no frontend)
    const simulatedUser = {
      id: userId,
      name: name,
      email: email,
      avatar: avatar,
      updatedAt: new Date().toISOString(),
      isSimulated: true
    };
    
    return NextResponse.json({
      success: true,
      user: simulatedUser,
      warning: 'Dados salvos localmente (sem persistência no banco)'
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
