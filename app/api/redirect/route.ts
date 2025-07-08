import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Exemplo de redirecionamento simples
  // Você pode personalizar a lógica conforme necessário
  return NextResponse.redirect(new URL('/', request.url));
}

// Exemplo: Função POST se você precisar lidar com solicitações POST
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Lógica de processamento aqui
  // ...

  return NextResponse.json({ success: true, message: 'Redirecionamento processado' });
}