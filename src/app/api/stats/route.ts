import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET() {
  try {
    const [activeChamps, totalPlayers, matchesPlayed, totalGoals] = await Promise.all([
      queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM championships WHERE status = $1', ['ativo']),
      queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM users'),
      queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM matches WHERE played = true'),
      queryOne<{ goals: string }>('SELECT COALESCE(SUM(home_score + away_score), 0)::text AS goals FROM matches WHERE played = true'),
    ]);

    return NextResponse.json({
      activeChampionships: parseInt(activeChamps?.count ?? '0'),
      totalPlayers: parseInt(totalPlayers?.count ?? '0'),
      matchesPlayed: parseInt(matchesPlayed?.count ?? '0'),
      totalGoals: parseInt(totalGoals?.goals ?? '0'),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
