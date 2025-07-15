// auth-config.ts
// Configuração para NextAuth.js - mantida para compatibilidade com arquivos legados

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Cognito from "next-auth/providers/cognito";
import CredentialsProvider from "next-auth/providers/credentials";

// Configurações do ambiente
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = new URL(process.env.NEXTAUTH_URL || "http://localhost:3000").hostname;

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Cognito({
      clientId: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET || "",
      issuer: process.env.NEXT_PUBLIC_USER_POOL_ID 
        ? `https://cognito-idp.${process.env.NEXT_PUBLIC_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_USER_POOL_ID}`
        : "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        
        // Este é apenas um stub - não faz autenticação real
        // A autenticação real agora é feita pelo AWS Amplify
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        domain: hostName === "localhost" ? undefined : `.${hostName}`,
      },
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/user/profile",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = (user as any).avatar || (user.image as string) || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};

export default authConfig;
