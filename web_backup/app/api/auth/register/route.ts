import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  return new Response(JSON.stringify({ success: false, message: 'Registro só pode ser feito no cliente.' }), { status: 400 });
}