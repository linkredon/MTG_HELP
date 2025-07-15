import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

// Configuração simples do NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/auth-monitor/auth-error",
  },
  callbacks: {
    jwt({ token, user }: { token: JWT, user?: User }) {
      if (user) {
        // O NextAuth já inclui id no token a partir do user.id ou user.sub
        token.id = user.id || user.sub || "";
        token.email = user.email || "";
        token.name = user.name || "";
        
        // Para compatibilidade com o tipo JWT estendido
        token.avatar = user.image || user.avatar || undefined;
        token.role = user.role || undefined;
      }
      return token;
    },
    session({ session, token }: { session: Session, token: JWT }) {
      if (session.user) {
        // Definir campos da sessão
        session.user.id = token.id;
        session.user.name = token.name || null; // Garantir valor não undefined
        session.user.email = token.email || null; // Garantir valor não undefined
        session.user.avatar = token.avatar || undefined;
        session.user.role = token.role || undefined;
        
        // Opcional: limpar imagem se estiver usando avatar
        // Isso evita ter campos duplicados (image e avatar)
        if (token.avatar) {
          session.user.image = token.avatar;
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default authOptions;
