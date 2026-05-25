import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { User } from '@/types';

export async function PUT(req: NextRequest) {
  try {
    const { id, name, username, photo_url, description } = await req.json();

    if (!name || !username) {
      return NextResponse.json({ error: 'Nome, usuário e senha são obrigatórios' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();
    const finalPhotoUrl =
      photo_url?.trim() ||
      `https://placehold.co/150x150/1e293b/a5b4fc?text=${encodeURIComponent(
        name.substring(0, 2).toUpperCase()
      )}`;

    const existing = await queryOne<User>('SELECT id FROM users WHERE username = $1 and id <> $2', [cleanUsername, id]);

    if (existing) {
      return NextResponse.json({ error: 'Este nome de usuário já está em uso' }, { status: 409 });
    }

    const rows = await query<User>(
      `
        UPDATE users 
            SET username = $2,
                name = $3,
                photo_url = $4,
                description = $5

        WHERE id = $1 RETURNING *;
      `,
      [id, cleanUsername, name.trim(), finalPhotoUrl, description?.trim() || '']
    );

    const user = rows[0];

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
