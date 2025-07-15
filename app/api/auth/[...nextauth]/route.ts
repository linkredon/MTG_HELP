import NextAuth from 'next-auth';
import { authConfig as authOptions } from '../../../../lib/auth-config';
import { NextResponse } from 'next/server';

// Certificar-se de que o host é confiável (necessário para NextAuth em App Router)
// @ts-ignore
globalThis.trustHost = true;

// Envolver o manipulador em try/catch para garantir que sempre retornamos JSON válido
const handler = async (req: Request, context: any) => {
  try {
    // Registrar informações de diagnóstico para depurar problemas com a API
    console.log("[NextAuth] Chamada para API NextAuth:", { 
      url: req.url,
      method: req.method
    });
    
    // Criar manipulador com as opções de autenticação
    const nextAuthHandler = NextAuth(authOptions);
    
    // Chamar o manipulador e obter a resposta
    const response = await nextAuthHandler(req, context);
    
    // Garantir que o tipo de conteúdo é JSON
    if (response && response.headers) {
      response.headers.set('Content-Type', 'application/json');
    }
    
    return response;
  } catch (error) {
    console.error("Erro no manipulador NextAuth:", error);
    
    // Garantir que sempre retornamos JSON em caso de erro
    const errorResponse = NextResponse.json(
      { error: "Falha na autenticação", details: error instanceof Error ? error.message : "Erro desconhecido" }, 
      { status: 500 }
    );
    
    // Garantir que o tipo de conteúdo é JSON
    errorResponse.headers.set('Content-Type', 'application/json');
    
    return errorResponse;
  }
};

export { handler as GET, handler as POST };