import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { Championship } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const championship = await queryOne<Championship>(`
      SELECT c.*, u.name AS winner_name, u.photo_url AS winner_photo,
             COUNT(cp.user_id)::int AS players_count
      FROM championships c
      LEFT JOIN users u ON u.id = c.winner_id
      LEFT JOIN championship_players cp ON cp.championship_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, u.name, u.photo_url
    `, [parseInt(id)]);

    if (!championship) {
      return NextResponse.json({ error: 'Campeonato não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ championship });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar campeonato' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query('DELETE FROM championships WHERE id = $1', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao deletar campeonato' }, { status: 500 });
  }
}
