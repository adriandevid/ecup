import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { User } from '@/types';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    const user = await queryOne<User>(
      'SELECT id, username, name, photo_url, description FROM users WHERE id = $1',
      [payload.userId]
    );

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const cookieStore = await cookies();
      
    cookieStore.set('futchamp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
