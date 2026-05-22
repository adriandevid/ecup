import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { PlayerStats } from '@/types';

export async function GET() {
  try {
    const players = await query<PlayerStats>(`
      SELECT
        u.id, u.username, u.name, u.photo_url, u.description,
        COUNT(DISTINCT cp.championship_id)::int  AS champs_count,
        COUNT(DISTINCT CASE WHEN m.played = true THEN m.id END)::int AS matches_played,
        COALESCE(SUM(
          CASE
            WHEN m.home_user_id = u.id AND m.played = true THEN m.home_score
            WHEN m.away_user_id = u.id AND m.played = true THEN m.away_score
            ELSE 0
          END
        ), 0)::int AS goals
      FROM users u
      LEFT JOIN championship_players cp ON cp.user_id = u.id
      LEFT JOIN matches m ON (m.home_user_id = u.id OR m.away_user_id = u.id)
      GROUP BY u.id, u.username, u.name, u.photo_url, u.description
      ORDER BY u.name ASC
    `);

    return NextResponse.json({ players });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar jogadores' }, { status: 500 });
  }
}
