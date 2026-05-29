import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { Permission, User } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, username, password, photo_url, description } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Nome, usuário e senha são obrigatórios' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();
    const finalPhotoUrl =
      photo_url?.trim() ||
      `https://placehold.co/150x150/1e293b/a5b4fc?text=${encodeURIComponent(
        name.substring(0, 2).toUpperCase()
      )}`;

    const existing = await queryOne<User>('SELECT id FROM users WHERE username = $1', [cleanUsername]);
    if (existing) {
      return NextResponse.json({ error: 'Este nome de usuário já está em uso' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rows = await query<User>(
      'INSERT INTO users (username, password, name, photo_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, name, photo_url, description',
      [cleanUsername, hashedPassword, name.trim(), finalPhotoUrl, description?.trim() || '']
    );

    const user = rows[0];

    await query<Permission>(
      'INSERT INTO public.permissions (role_id, user_id) VALUES($1, $2) RETURNING *;',
      [2, user.id]
    );

    const token = await signToken({ userId: user.id, username: user.username, name: user.name });

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
