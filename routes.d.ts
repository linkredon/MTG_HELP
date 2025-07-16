// Declarações de tipo para as rotas da API
declare module '@/app/api/auth-check/route' {
  export const GET: (request: Request) => Promise<Response>;
}

declare module '@/app/api/auth/[...nextauth]/route' {
  export const GET: (request: Request) => Promise<Response>;
  export const POST: (request: Request) => Promise<Response>;
}

declare module '@/app/api/register/route' {
  export const POST: (request: Request) => Promise<Response>;
}

// Tipos para contextos
declare module '@/contexts/AuthContext' {
  import { ReactNode } from 'react';
  
  export type User = {
    id: string;
    name?: string;
    email: string;
    role?: string;
    image?: string;
  };
  
  export type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    googleSignIn: () => Promise<void>;
  };
  
  export const AuthContext: React.Context<AuthContextType>;
  export function useAuth(): AuthContextType;
  export default function AuthProvider({ children }: { children: ReactNode }): JSX.Element;
}
