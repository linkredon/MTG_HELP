import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware está temporariamente desativado para evitar problemas de compilação
// Será reativado após resolvermos os problemas com o NextAuth

export function middleware(request: NextRequest) {
  // Para todas as rotas, continue normalmente sem interceptar
  return NextResponse.next();
}

// Configurar o middleware para não ser executado em nenhuma rota
export const config = {
  matcher: [],
};
