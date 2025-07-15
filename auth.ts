import type { DefaultSession, NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

/**
 * Nota: As extensões de tipo do NextAuth foram movidas para types/next-auth.d.ts
 * para evitar declarações duplicadas de tipos.
 */

// Verificar se as variáveis de ambiente essenciais estão configuradas
const checkEnvVariables = () => {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`ERRO DE CONFIGURAÇÃO: Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/auth-monitor/auth-error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Use asserções de tipo para evitar erros de tipagem
        token.id = user.id as string || '';
        token.name = user.name || '';
        token.email = user.email || '';
        // Garantir que avatar nunca seja null
        token.avatar = (user as any).avatar || (user.image as string) || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (session?.user) {
          // Adicionar campos personalizados para compatibilidade
          const extendedUser = session.user as any;
          extendedUser.id = token.id as string;
          extendedUser.name = token.name as string;
          extendedUser.email = token.email as string;
          extendedUser.avatar = token.avatar as string | undefined;
        }
        return session;
      } catch (error) {
        console.error("Erro no callback de sessão:", error);
        return { user: { id: '', name: '', email: '' } } as any;
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
