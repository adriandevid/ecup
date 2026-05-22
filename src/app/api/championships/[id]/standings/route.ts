import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Standings } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const champId = parseInt(id);

    const standings = await query<Standings>(`
      WITH player_stats AS (
        SELECT
          cp.user_id AS pid,
          COALESCE(SUM(CASE
            WHEN m.played = true AND m.home_user_id = cp.user_id AND m.home_score > m.away_score  THEN 3
            WHEN m.played = true AND m.away_user_id = cp.user_id AND m.away_score > m.home_score  THEN 3
            WHEN m.played = true AND (m.home_user_id = cp.user_id OR m.away_user_id = cp.user_id)
                 AND m.home_score = m.away_score THEN 1
            ELSE 0
          END), 0)::int AS points,
          COUNT(CASE WHEN m.played = true AND (m.home_user_id = cp.user_id OR m.away_user_id = cp.user_id) THEN 1 END)::int AS matches_played,
          COALESCE(SUM(CASE
            WHEN m.played = true AND m.home_user_id = cp.user_id AND m.home_score > m.away_score THEN 1
            WHEN m.played = true AND m.away_user_id = cp.user_id AND m.away_score > m.home_score THEN 1
            ELSE 0
          END), 0)::int AS wins,
          COALESCE(SUM(CASE WHEN m.played = true AND (m.home_user_id = cp.user_id OR m.away_user_id = cp.user_id) AND m.home_score = m.away_score THEN 1 ELSE 0 END), 0)::int AS draws,
          COALESCE(SUM(CASE
            WHEN m.played = true AND m.home_user_id = cp.user_id AND m.home_score < m.away_score THEN 1
            WHEN m.played = true AND m.away_user_id = cp.user_id AND m.away_score < m.home_score THEN 1
            ELSE 0
          END), 0)::int AS losses,
          COALESCE(SUM(CASE
            WHEN m.played = true AND m.home_user_id = cp.user_id THEN m.home_score
            WHEN m.played = true AND m.away_user_id = cp.user_id THEN m.away_score
            ELSE 0
          END), 0)::int AS goals_for,
          COALESCE(SUM(CASE
            WHEN m.played = true AND m.home_user_id = cp.user_id THEN m.away_score
            WHEN m.played = true AND m.away_user_id = cp.user_id THEN m.home_score
            ELSE 0
          END), 0)::int AS goals_against
        FROM championship_players cp
        LEFT JOIN matches m
          ON (m.home_user_id = cp.user_id OR m.away_user_id = cp.user_id)
          AND m.championship_id = cp.championship_id
        WHERE cp.championship_id = $1
        GROUP BY cp.user_id
      )
      SELECT ps.*, u.name, u.photo_url
      FROM player_stats ps
      JOIN users u ON u.id = ps.pid
      ORDER BY ps.points DESC, (ps.goals_for - ps.goals_against) DESC, ps.goals_for DESC, u.name ASC
    `, [champId]);

    return NextResponse.json({ standings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao calcular classificação' }, { status: 500 });
  }
}
