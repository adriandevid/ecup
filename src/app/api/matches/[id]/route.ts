import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { Match } from '@/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const matchId = parseInt(id);
    const { homeScore, awayScore } = await req.json();

    if (typeof homeScore !== 'number' || typeof awayScore !== 'number' || homeScore < 0 || awayScore < 0) {
      return NextResponse.json({ error: 'Placar inválido' }, { status: 400 });
    }

    const match = await queryOne<Match>('SELECT * FROM matches WHERE id = $1', [matchId]);
    if (!match) {
      return NextResponse.json({ error: 'Partida não encontrada' }, { status: 404 });
    }

    const champ = await queryOne<{ type: string }>(
      'SELECT type FROM championships WHERE id = $1',
      [match.championship_id]
    );
    const isKnockout = champ?.type === 'mata_mata';

    if (isKnockout && homeScore === awayScore) {
      return NextResponse.json(
        { error: 'Empate não permitido no mata-mata. Adicione gols de pênalti/prorrogação!' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE matches SET home_score = $1, away_score = $2, played = true WHERE id = $3',
      [homeScore, awayScore, matchId]
    );

    let champion: string | null = null;

    if (isKnockout) {
      const winnerId = homeScore > awayScore ? match.home_user_id : match.away_user_id;

      if (match.next_match_id) {
        const nextMatch = await queryOne<{ home_user_id: number | null }>(
          'SELECT home_user_id FROM matches WHERE id = $1',
          [match.next_match_id]
        );
        if (nextMatch?.home_user_id === null) {
          await query('UPDATE matches SET home_user_id = $1 WHERE id = $2', [winnerId, match.next_match_id]);
        } else {
          await query('UPDATE matches SET away_user_id = $1 WHERE id = $2', [winnerId, match.next_match_id]);
        }
      } else {
        await query(
          "UPDATE championships SET status = 'finalizado', winner_id = $1 WHERE id = $2",
          [winnerId, match.championship_id]
        );
        const winner = await queryOne<{ name: string }>('SELECT name FROM users WHERE id = $1', [winnerId]);
        champion = winner?.name ?? null;
      }
    } else {
      const championshipState = await queryOne<{ players: number, matchers: number, championship_concluded: boolean }>(`
        select 
          (select count(1) from championship_players a where a.championship_id = c.id) as players, 
          (select count(1) from matches p where p.championship_id = c.id) as partidas,
          (select count(1) from matches p where p.championship_id = c.id) = (select count(1) from matches p where p.championship_id = c.id and p.played = true) as finalizada
        from championships c 
        where c.id = $1
      `, [match.championship_id])

      if(championshipState != null && championshipState.championship_concluded) {
        await query(`
          update championships as cs
            set winner_id = a.id
            from (
              WITH player_stats AS (
                SELECT
                  cp.user_id AS pid,
                  cp.championship_id,
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
                GROUP BY cp.user_id, cp.championship_id
              )
              select  u.id, u.name
              FROM player_stats ps
              JOIN users u ON u.id = ps.pid
              ORDER BY ps.points DESC, (ps.goals_for - ps.goals_against) DESC, ps.goals_for DESC, u.name asc limit 1
            ) as a
            where cs.id = $1
        `, [match.championship_id])
      }
    }

    return NextResponse.json({ success: true, champion });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao salvar placar' }, { status: 500 });
  }
}
