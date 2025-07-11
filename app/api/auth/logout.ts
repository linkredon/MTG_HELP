import { NextResponse } from 'next/server';

export async function POST() {
  // Limpar cookies de sessão
  return NextResponse.json({ success: true }, {
    headers: {
      'Set-Cookie': 'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
    },
  });
}
