import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '../../../../lib/authOptions';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    user: {
      name: session.user.name || session.user.email,
      email: session.user.email,
      avatar: session.user.avatar || session.user.image || '/default-avatar.png',
      theme: 'dark',
      notifications: true
    }
  });
}
