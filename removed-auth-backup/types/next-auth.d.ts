import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      avatar?: string;
      role?: string;
      joinedAt?: string;
      collectionsCount?: number;
      totalCards?: number;
      achievements?: string[];
    }
  }

  /**
   * Extending the built-in user types
   * Removido o campo 'id' para evitar duplicação com o tipo padrão
   */
  interface User {
    // Nota: o campo 'id' já existe no tipo User padrão
    sub?: string;         // Campo sub usado por OAuth providers como Google
    avatar?: string;
    role?: string;
    joinedAt?: string;
    collectionsCount?: number;
    totalCards?: number;
    achievements?: string[];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the built-in JWT types
   */
  interface JWT {
    id: string;
    role?: string;
    avatar?: string;
    joinedAt?: string;
    collectionsCount?: number;
    totalCards?: number;
    achievements?: string[];
  }
}