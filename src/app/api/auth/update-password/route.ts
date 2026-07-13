import { query, queryOne } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

export async function POST(req: NextRequest) {
    const { password, recover_hashcode }: { password: string, recover_hashcode: string } = await req.json();

    const reset_token = await queryOne<{ id: number, expiration_date: string, email: string }>('SELECT id, expiration_date, email FROM reset_tokens WHERE hash_code = $1  order by id desc;', [recover_hashcode]);

    if (reset_token == null) {
        return NextResponse.json({ message: "O código de solicitação de troca de senha não existe ou não é válido!" }, { status: 400 });
    }

    if (reset_token != null && new Date() > new Date(reset_token.expiration_date)) {
        return NextResponse.json({ message: "O token referido já expirou, solicite novamente um token!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rows = await query<User>(
        `
            UPDATE users 
                SET password = $2
            WHERE email = $1 RETURNING *;
          `,
        [reset_token.email, hashedPassword]
    );

    if (rows.length == 0) {
        return NextResponse.json({ message: "Erro ao atualizar a senha do usuário!" }, { status: 400 });
    }

    await query<{ email: string }>("delete from reset_tokens where email = $1 RETURNING email;", [reset_token.email]);

    return NextResponse.json({}, { status: 200 });
}