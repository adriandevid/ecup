import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Championship } from '@/types';

export async function GET() {
  try {
    const championships = await query<Championship>(`
      SELECT c.id, c.name, c.type, c.status, c.winner_id,
             COUNT(cp.user_id)::int AS players_count
      FROM championships c
      LEFT JOIN championship_players cp ON cp.championship_id = c.id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    return NextResponse.json({ championships });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar campeonatos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, type, playerIds } = await req.json();

    if (!name || !type || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    if (type === 'pontos_corridos' && playerIds.length < 2) {
      return NextResponse.json({ error: 'Mínimo 2 participantes para pontos corridos' }, { status: 400 });
    }

    if (type === 'mata_mata' && ![2, 4, 8, 16].includes(playerIds.length)) {
      return NextResponse.json({ error: 'Mata-Mata requer 2, 4, 8 ou 16 participantes' }, { status: 400 });
    }

    const rows = await query<{ id: number }>(
      "INSERT INTO championships (name, type, status) VALUES ($1, $2, 'ativo') RETURNING id",
      [name, type]
    );
    const champId = rows[0].id;

    for (const playerId of playerIds) {
      await query(
        'INSERT INTO championship_players (championship_id, user_id) VALUES ($1, $2)',
        [champId, playerId]
      );
    }

    if (type === 'pontos_corridos') {
      await generateRoundRobin(champId, playerIds);
      await generateRoundRobin(champId, playerIds, true);
    } else {
      await generateKnockout(champId, playerIds);
    }

    return NextResponse.json({ id: champId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar campeonato' }, { status: 500 });
  }
}

async function generateRoundRobin(champId: number, players: number[], return_rounds?: boolean | undefined) {
  const list = [...players];
  if (list.length % 2 !== 0) list.push(0);

  const totalTeams = list.length;
  const totalRounds = totalTeams - 1;
  const halfSize = totalTeams / 2;

  if (return_rounds) {
    for (let round = totalRounds + 1; round <= totalRounds * 2; round++) {
      for (let i = 0; i < halfSize; i++) {
        const home = list[i];
        const away = list[totalTeams - 1 - i];
        if (home !== 0 && away !== 0) {
          //const [h, a] = round % 2 === 0 ? [away, home] : [home, away];
          await query(
            'INSERT INTO matches (championship_id, round, home_user_id, away_user_id, home_score, away_score, played) VALUES ($1,$2,$3,$4,0,0,false)',
            [champId, round, away, home]
          );
        }
      }
      list.splice(1, 0, list.pop()!);
    }
  } else {
    for (let round = 1; round <= totalRounds; round++) {
      for (let i = 0; i < halfSize; i++) {
        const home = list[i];
        const away = list[totalTeams - 1 - i];
        if (home !== 0 && away !== 0) {
          //const [h, a] = round % 2 === 0 ? [away, home] : [home, away];
          await query(
            'INSERT INTO matches (championship_id, round, home_user_id, away_user_id, home_score, away_score, played) VALUES ($1,$2,$3,$4,0,0,false)',
            [champId, round, home, away]
          );
        }
      }
      list.splice(1, 0, list.pop()!);
    }
  }
}

async function generateKnockout(champId: number, players: number[]) {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const numPlayers = shuffled.length;

  const roundsConfig: number[] = [];
  let tmp = numPlayers;
  while (tmp > 1) { roundsConfig.push(tmp / 2); tmp = tmp / 2; }

  let nextRoundMatches: number[] = [];
  const totalRounds = roundsConfig.length;

  for (let rIndex = totalRounds - 1; rIndex >= 0; rIndex--) {
    const matchCount = roundsConfig[rIndex];
    const roundNumber = rIndex + 1;
    const matchesOfThisRound: number[] = [];

    for (let m = 0; m < matchCount; m++) {
      const nextMatchId = nextRoundMatches.length > 0
        ? nextRoundMatches[Math.floor(m / 2)]
        : null;

      const homeUser = rIndex === 0 ? shuffled[m * 2] : null;
      const awayUser = rIndex === 0 ? shuffled[m * 2 + 1] : null;

      const rows = await query<{ id: number }>(
        'INSERT INTO matches (championship_id, round, home_user_id, away_user_id, played, next_match_id) VALUES ($1,$2,$3,$4,false,$5) RETURNING id',
        [champId, roundNumber, homeUser, awayUser, nextMatchId]
      );
      matchesOfThisRound.push(rows[0].id);
    }

    nextRoundMatches = matchesOfThisRound;
  }
}
