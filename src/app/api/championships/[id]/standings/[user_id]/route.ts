import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { PlayerStanding } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string, user_id: string }> }
) {
  try {
    const { id, user_id } = await params;

    const champId = parseInt(id);
    const userId = parseInt(user_id);

    const standings = await queryOne<PlayerStanding>(`
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
        WHERE cp.championship_id = $2
        GROUP BY cp.user_id
    )
    SELECT 
        ps.*, 
        u.name, 
        u.photo_url,
    (
        SELECT 
            json_agg(
            json_build_object(
                'id', m.id,
                'championship_id', m.championship_id,
                'home_user_id', m.home_user_id,
                'away_user_id', m.away_user_id,
                'next_match_id', m.next_match_id,
                'home_name', uh."name",
                'home_photo', uh.photo_url,
                'away_name', ua."name",
                'away_photo', ua.photo_url, 
                'home_score', m.home_score,
                'away_score', m.away_score,
                'played',  m.played,
                'round', m.round
            )
            )
            from matches m
            join users uh on uh.id = m.home_user_id 
            join users ua on ua.id = m.away_user_id
            where (m.home_user_id = $1 OR m.away_user_id = $1)  and m.championship_id = $2
    ) as matches,
    (
   		select pos.position
   		from (select ROW_NUMBER() OVER (ORDER by s.points desc, (s.goals_for - s.goals_against) desc, s.goals_for desc) as "position", s.pid from player_stats s  ORDER BY s.points DESC, (s.goals_for - s.goals_against) DESC, s.goals_for DESC) pos
   		where pos.pid = $1
   		order by pos.position asc
   		limit 1
   )
    FROM player_stats ps
    JOIN users u ON u.id = ps.pid
    where u.id = $1
    ORDER BY ps.points DESC, (ps.goals_for - ps.goals_against) DESC, ps.goals_for DESC, u.name asc;
    `, [userId, champId]);

    return NextResponse.json(standings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao calcular classificação' }, { status: 500 });
  }
}
