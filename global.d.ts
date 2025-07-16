// Este arquivo fornece declarações de tipos globais para o projeto

declare namespace NodeJS {
  interface ProcessEnv {
    // NextAuth
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;
    
    // Node Environment
    NODE_ENV?: 'development' | 'production' | 'test';
    
    // AWS/Cognito
    NEXT_PUBLIC_USER_POOL_ID?: string;
    NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID?: string;
    NEXT_PUBLIC_REGION?: string;
    NEXT_PUBLIC_COGNITO_DOMAIN?: string;
    NEXT_PUBLIC_HOSTED_UI_DOMAIN?: string;
    OAUTH_DOMAIN?: string;
    OAUTH_REDIRECT_SIGNIN?: string;
    OAUTH_REDIRECT_SIGNOUT?: string;
    OAUTH_REDIRECT_SIGNIN_PRODUCTION?: string;
    OAUTH_REDIRECT_SIGNOUT_PRODUCTION?: string;
    
    // AWS Credentials
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AMZ_REGION?: string;
    AMZ_ACCESS_KEY_ID?: string;
    AMZ_SECRET_ACCESS_KEY?: string;
    
    // DynamoDB
    DYNAMO_USERS_TABLE?: string;
    DYNAMO_COLLECTIONS_TABLE?: string;
    DYNAMO_DECKS_TABLE?: string;
    DYNAMO_FAVORITES_TABLE?: string;
    
    // Google OAuth
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    
    // Application
    NEXT_PUBLIC_DEMO_MODE?: string;
    NEXT_PUBLIC_API_ENDPOINT?: string;
    NEXT_PUBLIC_API_KEY?: string;
    NEXT_PUBLIC_ADMIN_CODE?: string;
    VERCEL_URL?: string;
    
    // Outras variáveis
    [key: string]: string | undefined;
  }
}

// Declaração global para process
declare const process: {
  env: NodeJS.ProcessEnv;
  cwd(): string;
};

// Declarações para fs e path - necessário para Route Handlers
declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding: string): string;
  export function readFileSync(path: string, options: { encoding: string; flag?: string }): string;
  export function writeFileSync(path: string, data: string): void;
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
}
