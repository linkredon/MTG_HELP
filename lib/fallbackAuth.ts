// Arquivo modificado para remover dependências de next-auth
// Usando tipos simplificados para compatibilidade

// Tipo simplificado para compatibilidade
export type SimplifiedAuthOptions = {
  providers: Array<{id: string, name: string}>;
  session?: {
    strategy: string;
    maxAge: number;
  };
  callbacks?: Record<string, Function>;
  pages: {
    signIn: string;
    error: string;
  };
  secret?: string;
  debug?: boolean;
}

// Configuração mínima para quando não tivermos acesso ao DynamoDB
export const fallbackAuthOptions: SimplifiedAuthOptions = {
  providers: [
    {
      id: "credentials",
      name: 'Demo'
    },
    {
      id: "google",
      name: 'Google'
    }
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {},
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development',
  debug: process.env.NODE_ENV === 'development',
};
