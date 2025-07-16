// Declarações de tipo para as rotas da API
declare module '@/app/api/auth-check/route' {
  export function GET(request: Request): Promise<Response>;
}

declare module '@/app/api/auth/[...nextauth]/route' {
  export function GET(request: Request): Promise<Response>;
  export function POST(request: Request): Promise<Response>;
}

declare module '@/app/api/register/route' {
  export function POST(request: Request): Promise<Response>;
}

// Rotas para OAuth e autenticação
declare module '@/app/api/auth/register/route' {
  export function POST(request: Request): Promise<Response>;
}

declare module '@/app/api/auth/fix-oauth-config/route' {
  export function GET(request: Request): Promise<Response>;
  export function POST(request: Request): Promise<Response>;
}

declare module '@/app/api/auth/setup-oauth/route' {
  export function GET(request: Request): Promise<Response>;
  export function POST(request: Request): Promise<Response>;
}

declare module '@/app/api/auth/update-oauth-credentials/route' {
  export function POST(request: Request): Promise<Response>;
}

declare module '@/app/api/confirm-code/route' {
  export function POST(request: Request): Promise<Response>;
}
