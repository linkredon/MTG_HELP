import { getServerSession } from "next-auth/next";
import { authConfig as authOptions } from "../../../lib/auth-config";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("API de sessão chamada");
    
    const session = await getServerSession(authOptions);
    
    // Garantir que o tipo de conteúdo é definido corretamente
    const response = NextResponse.json(session ?? { user: null });
    response.headers.set("Content-Type", "application/json");
    
    return response;
  } catch (error) {
    console.error("Erro ao obter sessão:", error);
    
    // Garantir que sempre retornamos JSON mesmo em caso de erro
    const response = NextResponse.json({ 
      user: null, 
      error: "Falha ao obter sessão",
      errorDetails: error instanceof Error ? error.message : "Erro desconhecido" 
    }, { status: 500 });
    
    // Garantir que o tipo de conteúdo é definido corretamente
    response.headers.set("Content-Type", "application/json");
    
    return response;
  }
}
