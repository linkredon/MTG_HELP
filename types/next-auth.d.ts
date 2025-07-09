import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      role?: string;
      joinedAt?: string;
      collectionsCount?: number;
      totalCards?: number;
      achievements?: any[];
    };
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    joinedAt?: string;
    collectionsCount?: number;
    totalCards?: number;
    achievements?: any[];
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
    achievements?: any[];
  }
}