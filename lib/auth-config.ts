// auth-config.ts
// Este arquivo foi modificado para remover dependências do next-auth
// Mantendo estrutura mínima para evitar erros de compilação

// Configurações do ambiente
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = new URL(process.env.NEXTAUTH_URL || "http://localhost:3000").hostname;

// Tipo simplificado para compatibilidade
export type SimplifiedAuthOptions = {
  pages: {
    signIn: string;
    signOut: string;
    error: string;
    newUser: string;
  }
}

// Configuração simplificada sem dependências do next-auth
export const authConfig: SimplifiedAuthOptions = {
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/user/profile",
  }
};

export default authConfig;
