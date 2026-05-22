import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { Match } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const champId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const round = searchParams.get('round');

    const queryParams: unknown[] = [champId];
    let sql = `
      SELECT m.*,
             u1.name AS home_name, u1.photo_url AS home_photo,
             u2.name AS away_name, u2.photo_url AS away_photo
      FROM matches m
      LEFT JOIN users u1 ON u1.id = m.home_user_id
      LEFT JOIN users u2 ON u2.id = m.away_user_id
      WHERE m.championship_id = $1
    `;

    if (round) {
      sql += ' AND m.round = $2';
      queryParams.push(parseInt(round));
    }

    sql += ' ORDER BY m.round ASC, m.id ASC';

    const matches = await query<Match>(sql, queryParams);
    const maxRoundRow = await queryOne<{ max_round: number }>(
      'SELECT MAX(round)::int AS max_round FROM matches WHERE championship_id = $1',
      [champId]
    );

    return NextResponse.json({ matches, maxRound: maxRoundRow?.max_round ?? 1 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar partidas' }, { status: 500 });
  }
}
