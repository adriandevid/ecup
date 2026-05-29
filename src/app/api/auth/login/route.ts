import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { User } from '@/types';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 });
    }

    const rows = await query<User & { password: string }>(
      'SELECT * FROM users WHERE username = $1',
      [username.toLowerCase().trim()]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, username: user.username, name: user.name });

    const { ...safeUser } = user;

    const cookieStore = await cookies();
  
    cookieStore.set('futchamp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
