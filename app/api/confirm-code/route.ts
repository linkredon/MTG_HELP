import { NextRequest, NextResponse } from 'next/server';
import { confirmSignUp } from '../../../lib/auth-helpers';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ success: false, error: 'Email e código são obrigatórios.' }, { status: 400 });
  }
  const result = await confirmSignUp(email, code);
  return NextResponse.json(result);
}
