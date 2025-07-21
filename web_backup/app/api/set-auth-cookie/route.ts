import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('mtg_user_authenticated', 'true', {
    path: '/',
    maxAge: 60 * 60,
    sameSite: 'lax', // Pode ajustar para 'strict' ou 'none' se necessário
    secure: false,   // Garantir que funcione em localhost
    httpOnly: false
  });
  return response;
} 