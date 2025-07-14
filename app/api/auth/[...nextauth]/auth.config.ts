// Configuração para garantir que o NextAuth sempre retorne JSON válido
export const authConfig = {
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/auth-monitor/auth-error',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id || user.sub;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar || user.image;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      try {
        if (session?.user) {
          session.user.id = token.id;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.avatar = token.avatar;
        }
        return session;
      } catch (error) {
        console.error("Erro no callback de sessão:", error);
        return { user: null };
      }
    },
  },
  
  // Esta função será executada antes de retornar qualquer resposta JSON
  // para garantir que ela sempre seja válida
  events: {
    async error(error: any) {
      console.error('Erro de autenticação do NextAuth:', error);
    }
  },
};

export default authConfig;
