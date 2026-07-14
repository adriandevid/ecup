import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { PlayerStats } from '@/types';

export async function GET() {
  try {
    const players = await query<PlayerStats>(`
      SELECT
        ul.id, ul.username, ul.name, ul.photo_url, ul.description,
        COUNT(DISTINCT cp.championship_id)::int  AS champs_count,
        (
        select 
          STRING_AGG(cc.name, ', ' ORDER BY cc.name)
        from championship_players cp 
        join championships cc on cc.id = cp.championship_id 
        where cp.user_id = ul.id
        ) as championships,
        (
        select 
          STRING_AGG(cc.name, ', ' ORDER BY cc.name)
        from championship_players cp 
        join championships cc on cc.id = cp.championship_id 
        where cp.user_id = ul.id and cc.winner_id = ul.id
        ) as championships_win,
        COUNT(DISTINCT CASE WHEN m.played = true THEN m.id END)::int AS matches_played,
        COALESCE(SUM(
          CASE
            WHEN m.home_user_id = ul.id AND m.played = true THEN m.home_score
            WHEN m.away_user_id = ul.id AND m.played = true THEN m.away_score
            ELSE 0
          END
        ), 0)::int AS goals,
        COALESCE(SUM(
          CASE
            WHEN m.home_user_id = ul.id AND m.played = true THEN m.away_score
            WHEN m.away_user_id = ul.id AND m.played = true THEN m.home_score
            ELSE 0
          END
        ), 0)::int AS goals_conceded
      FROM users ul
      LEFT JOIN championship_players cp ON cp.user_id = ul.id
      LEFT JOIN matches m ON (m.home_user_id = ul.id OR m.away_user_id = ul.id)
      GROUP BY ul.id, ul.username, ul.name, ul.photo_url, ul.description
      ORDER BY ul.name asc;
    `);

    return NextResponse.json({ players });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar jogadores' }, { status: 500 });
  }
}
