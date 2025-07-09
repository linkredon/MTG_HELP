import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          
          // Verificar email e senha
          const user = await User.findOne({ email: credentials.email }).select('+password');
          
          if (!user) {
            throw new Error('Email ou senha inválidos');
          }
          
          // Verificar se a senha corresponde
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          
          if (!isMatch) {
            throw new Error('Email ou senha inválidos');
          }
          
          // Retornar objeto de usuário sem a senha
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            joinedAt: user.joinedAt,
            collectionsCount: user.collectionsCount,
            totalCards: user.totalCards,
            achievements: user.achievements
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };