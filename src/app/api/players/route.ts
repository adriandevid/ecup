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
          		STRING_AGG(concat(b.name, ' (', b.status, ')'), ', ' ORDER BY b.name)
          	from (
          		select distinct 
		          	cc.id, cc.name, 
		          	cc.winner_id, cc.runner_up_id, cc.third_place_id, cc.first_relegated_id, 
		          	cc.second_relegated_id,
		          	(case 
		          		when cc.winner_id = ul.id and cc.status = 'finalizado' then 'Vencedor'
		          		when cc.runner_up_id = ul.id and cc.status = 'finalizado' then 'Segundo Colocado'
		          		when cc.third_place_id = ul.id and cc.status = 'finalizado' then 'Terceiro Colocado'
		          		when cc.first_relegated_id = ul.id and cc.status = 'finalizado' then 'Rebaixado'
		          		when cc.second_relegated_id = ul.id and cc.status = 'finalizado' then 'Rebaixado'
		          		when cc.status = 'ativo' then 'Disputando'
		          		when cc.status = 'finalizado' then 'Inviolável'
		          	else
		          		'Disputando'
		            end)  as status
		          from championship_players cp 
		          join championships cc on cc.id = cp.championship_id
		          where cp.user_id = ul.id
          	) b
          )
           as championships,
          COUNT(DISTINCT CASE WHEN m.played = true THEN m.id END)::int AS matches_played,
          (
	        select
	            COALESCE(SUM(
	              CASE
	                WHEN m.home_user_id = ul.id AND m.played = true THEN m.home_score
	                WHEN m.away_user_id = ul.id AND m.played = true THEN m.away_score
	                ELSE 0
	              END
	            ), 0)::int
	        from matches m 
	        where (m.away_user_id = ul.id or m.home_user_id = ul.id) and m.played = true
      	) AS goals,
      (
        select
            COALESCE(SUM(
              CASE
                WHEN m.home_user_id = ul.id AND m.played = true THEN m.away_score
                WHEN m.away_user_id = ul.id AND m.played = true THEN m.home_score
                ELSE 0
              END
            ), 0)::int
        from matches m 
        where (m.away_user_id = ul.id or m.home_user_id = ul.id) and m.played = true
      ) AS goals_conceded
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
