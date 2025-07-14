import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";

// Configuração mínima do NextAuth para quando não tivermos acesso ao DynamoDB
export const fallbackAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // Modo de demonstração - qualquer combinação válida de email/senha funciona
        if (credentials?.email && credentials?.password.length >= 6) {
          return {
            id: "demo-user-1",
            name: "Usuário Demo",
            email: credentials.email,
            role: "user",
            avatar: "", // Valor vazio em vez de null para satisfazer o tipo User
            joinedAt: new Date().toISOString(),
            collectionsCount: 3,
            totalCards: 150,
            achievements: ['first_login', 'collection_created']
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        token.joinedAt = user.joinedAt;
        token.collectionsCount = user.collectionsCount;
        token.totalCards = user.totalCards;
        token.achievements = user.achievements;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.joinedAt = token.joinedAt;
        session.user.collectionsCount = token.collectionsCount;
        session.user.totalCards = token.totalCards;
        session.user.achievements = token.achievements;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development',
  debug: process.env.NODE_ENV === 'development',
};
