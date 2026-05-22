import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { User } from '@/types';

const DEMO_PLAYERS = [
  { u: 'messi',      n: 'Lionel Messi',      f: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=150&auto=format&fit=crop', d: 'O melhor de todos os tempos. Controle de bola incomparável.' },
  { u: 'cr7',        n: 'Cristiano Ronaldo', f: 'https://images.unsplash.com/photo-1540747737956-37872175267a?q=80&w=150&auto=format&fit=crop', d: 'Máquina de fazer gols. Foco, determinação e cabeceio letal.' },
  { u: 'neymar',     n: 'Neymar Jr',         f: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=150&auto=format&fit=crop', d: 'Ousadia e alegria. Mestre do drible e do improviso.' },
  { u: 'marta',      n: 'Rainha Marta',      f: 'https://images.unsplash.com/photo-1565995475766-4781c7fbf55c?q=80&w=150&auto=format&fit=crop', d: 'A Rainha do futebol brasileiro. Visão de jogo genial.' },
  { u: 'vini',       n: 'Vini Jr',           f: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=150&auto=format&fit=crop', d: 'Velocidade explosiva e coração merengue.' },
  { u: 'mbappe',     n: 'Kylian Mbappé',     f: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=150&auto=format&fit=crop', d: 'Arrancada implacável. Chute mortal de fora da área.' },
  { u: 'haaland',    n: 'Erling Haaland',    f: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=150&auto=format&fit=crop', d: 'O Cometa norueguês. Força física pura e gols avassaladores.' },
  { u: 'bellingham', n: 'Jude Bellingham',   f: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=150&auto=format&fit=crop', d: 'Elegância no meio-campo e infiltrações surpreendentes.' },
];

export async function POST() {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);

    await query('DELETE FROM championship_players');
    await query('DELETE FROM matches');
    await query('DELETE FROM championships');
    await query('DELETE FROM users');

    for (const p of DEMO_PLAYERS) {
      await query(
        'INSERT INTO users (username, password, name, photo_url, description) VALUES ($1, $2, $3, $4, $5)',
        [p.u, hashedPassword, p.n, p.f, p.d]
      );
    }

    const rows = await query<User>(
      "SELECT id, username, name, photo_url, description FROM users WHERE username = 'messi'"
    );
    const messi = rows[0];

    const token = await signToken({ userId: messi.id, username: messi.username, name: messi.name });

    return NextResponse.json({ token, user: messi });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao carregar demo' }, { status: 500 });
  }
}
