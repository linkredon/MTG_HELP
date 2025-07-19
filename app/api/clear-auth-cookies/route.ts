import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  // Limpar todos os cookies de autenticação
  response.cookies.set('mtg_user_authenticated', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });
  
  response.cookies.set('amplify.auth.tokens', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });
  
  response.cookies.set('amplify-signin-with-hostedUI', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });
  
  response.cookies.set('mtg_auth_in_progress', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });
  
  return response;
} 