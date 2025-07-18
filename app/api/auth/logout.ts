import { NextResponse } from 'next/server';

export async function GET() {
  return new Response(JSON.stringify({ success: false, message: 'Logout só pode ser feito no cliente.' }), { status: 400 });
}
