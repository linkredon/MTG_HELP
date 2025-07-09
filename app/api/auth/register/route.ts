import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validar campos
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Registrar usuário
    const result = await registerUser({ name, email, password });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao registrar usuário' },
      { status: 500 }
    );
  }
}