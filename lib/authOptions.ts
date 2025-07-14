import GoogleProvider from 'next-auth/providers/google';

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

// Configurar os provedores apenas se as variáveis de ambiente estiverem disponíveis
const configureProviders = () => {
  const envOk = checkEnvVariables();
  
  if (!envOk) {
    console.warn('NextAuth configurado com provedores reduzidos devido a variáveis de ambiente ausentes');
    return [];
  }
  
  return [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ];
};

const authOptions = {
  providers: configureProviders(),
  secret: process.env.NEXTAUTH_SECRET,
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
  // Adicionar páginas de autenticação personalizadas
  pages: {
    signIn: '/login',
    error: '/auth-monitor/auth-error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
