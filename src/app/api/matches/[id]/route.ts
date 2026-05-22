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
    }

    return NextResponse.json({ success: true, champion });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao salvar placar' }, { status: 500 });
  }
}
