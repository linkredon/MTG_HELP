// Removendo dependência de next-auth que foi removido do projeto
import { NextResponse } from 'next/server';

// Este arquivo é mantido apenas para compatibilidade com rotas existentes
// A autenticação agora é feita pelo AWS Amplify/Cognito

// Manipulador que retorna uma resposta para redirecionar para o novo sistema de autenticação
const handler = async (req: Request) => {
  console.log("[Auth API] Redirecionando para nova autenticação com Amplify:", { 
    url: req.url,
    method: req.method
  });
  
  // Retornar resposta JSON informando sobre a migração
  const response = NextResponse.json({ 
    message: "API NextAuth desativada. O sistema agora usa AWS Amplify para autenticação.",
    status: "redirect",
    redirectTo: "/login"
  }, { status: 307 });
  
  return response;
};

export { handler as GET, handler as POST };