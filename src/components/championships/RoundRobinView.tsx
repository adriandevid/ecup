'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { Match, PlayerStanding, Standings } from '@/types';
import { cn } from '@/lib/tailwindcss';
import Image from 'next/image';
import ProfileChampionship from './ProfileChampionship';

interface Props {
  champId: number;
}
function PlayerImageTable({ row }: { row: Standings }) {
  const [noLoadImage, setNoLoadImage] = useState<boolean>(false);

  return (
    <Image
      src={`${row.photo_url == undefined || (row.photo_url != undefined && !row.photo_url.includes('jpg') && !row.photo_url.includes('png') && !row.photo_url.includes('jpeg')) || noLoadImage ? '/images/default_icon.png' : row.photo_url}?v=${new Date().getTime()}`}
      className="w-7 h-7 rounded-lg object-cover"
      alt={`profile`}
      width={28}
      unoptimized
      decoding='async'
      height={28}
      onErrorCapture={() => {
        setNoLoadImage(true);
      }}
    />
  )
}

function PlayerImageMatch({ photo_url }: { photo_url?: string | undefined }) {
  const [noLoadImage, setNoLoadImage] = useState<boolean>(false);

  return (
    <Image
      src={`${photo_url == undefined || (photo_url != undefined && !photo_url.includes('jpg') && !photo_url.includes('png') && !photo_url.includes('jpeg')) || noLoadImage ? '/images/default_icon.png' : photo_url}?v=${new Date().getTime()}`}
      className="w-10 h-10 rounded-lg object-cover"
      alt={`profile`}
      width={40}
      unoptimized
      decoding='async'
      height={40}
      onErrorCapture={() => {
        setNoLoadImage(true);
      }}
    />
  )
}

export function RoundRobinView({ champId }: Props) {
  const { showToast, addQueryLog, socket } = useApp();
  const [standings, setStandings] = useState<Standings[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [maxRound, setMaxRound] = useState(1);
  const [loading, isLoading] = useState<boolean>(false);
  const [selectedRound, setSelectedRound] = useState(1);
  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({});

  const loadStandings = useCallback(async () => {
    try {
      const data = await apiClient<{ standings: Standings[] }>(`/api/championships/${champId}/standings`);
      setStandings(data.standings);
      addQueryLog('CALCULATE STANDINGS', `WITH player_stats AS (...) SELECT * FROM player_stats JOIN users ORDER BY points DESC WHERE championship_id = ${champId}`);
    } catch (err) { console.error(err); }
  }, [champId, addQueryLog]);

  const loadMatches = useCallback(async (round: number) => {
    try {
      isLoading(true);
      const data = await apiClient<{ matches: Match[]; maxRound: number }>(
        `/api/championships/${champId}/matches?round=${round}`
      );
      setMatches(data.matches);
      setMaxRound(data.maxRound);
      addQueryLog('FILTER ROUND MATCHES', `SELECT m.*, u1.name, u2.name FROM matches WHERE championship_id = ${champId} AND round = ${round}`);
      isLoading(false);
    } catch (err) {
      isLoading(false);
      console.error(err);
    }
  }, [champId, addQueryLog]);


  const loadPlayerStanding = async (player_id: number) => {
    try {
      isLoading(true);

      const data = await apiClient<PlayerStanding>(
        `/api/championships/${champId}/standings/${player_id}`
      );

      isLoading(false);
      setStandingSelectedPlayer(data);
      showModalChampionship(true);
    } catch (err) {
      isLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    loadStandings();
    loadMatches(selectedRound);
  }, [loadStandings, loadMatches, selectedRound]);


  async function saveScore(matchId: number) {
    const s = scores[matchId];
    if (!s) return;

    const home = parseInt(s.home);
    const away = parseInt(s.away);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      showToast('Erro de Placar', 'Digite um placar válido (zero ou maior).', 'error');
      return;
    }
    try {
      isLoading(true);
      await apiClient(`/api/matches/${matchId}`, {
        method: 'PUT',
        body: JSON.stringify({ homeScore: home, awayScore: away }),
      });

      addQueryLog('UPDATE SCORE', `UPDATE matches SET home_score = ${home}, away_score = ${away}, played = true WHERE id = ${matchId}`);
      showToast('Resultado Salvo', 'A partida foi computada no banco!', 'success');
      setScores(prev => { const n = { ...prev }; delete n[matchId]; return n; });

      await loadStandings();
      await loadMatches(selectedRound);
      isLoading(false);

      if (socket) {
        const match = matches.filter(x => x.id == matchId)[0];
        socket.emit('match-status', `Resultado da partida entre ${match.home_name} e ${match.away_name} foi de ${match.home_score} a ${match.away_score}`)
      }

    } catch (err) {
      isLoading(false);
      showToast('Erro', (err as Error).message, 'error');
    }
  }

  async function resetScore(matchId: number) {
    try {
      isLoading(true);
      await apiClient(`/api/matches/${matchId}/reset`, { method: 'PUT' });
      addQueryLog('EDIT RESULT', `UPDATE matches SET played = false WHERE id = ${matchId}`);
      await loadStandings();
      await loadMatches(selectedRound);
    } catch (err) { 
      isLoading(false);
      console.error(err); 
    }
  }


  const [openModalChampionship, showModalChampionship] = useState<boolean>(false);
  const [standingSelectedPlayer, setStandingSelectedPlayer] = useState<PlayerStanding | undefined>();

  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {
        loading && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/[.3]'>
            <div className='flex flex-row justify-center items-center w-full h-full'>
              <div className="text-center py-12 text-white">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-2" />
                <p className="text-sm">Carregando...</p>
              </div>
            </div>
        </div>
        )
      }
      <div className="lg:col-span-7 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <i className="fa-solid fa-star text-emerald-400" /> Classificação Geral
        </h3>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-4 text-center w-12">Pos</th>
                <th className="py-3 px-4">Jogador</th>
                <th className="py-3 px-4 text-center">P</th>
                <th className="py-3 px-4 text-center">J</th>
                <th className="py-3 px-4 text-center">V</th>
                <th className="py-3 px-4 text-center">E</th>
                <th className="py-3 px-4 text-center">D</th>
                <th className="py-3 px-4 text-center">GP</th>
                <th className="py-3 px-4 text-center">GC</th>
                <th className="py-3 px-4 text-center">SG</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {standings.map((row, pos) => {
                const sg = row.goals_for - row.goals_against;
                return (
                  <tr
                    onClick={() => loadPlayerStanding(row.pid)}
                    key={row.pid}
                    className={
                      cn(
                        "border-b border-slate-800 transition cursor-pointer",
                        pos < 3 ? "hover:bg-green-300/50 bg-emerald-400/[.5]" :
                          pos >= (standings.length - 4) ?
                            "hover:bg-red-300/50 bg-red-400/[.5]" :
                            "hover:bg-slate-800/50"
                      )
                    }
                  >
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{pos + 1}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center space-x-3">
                        <PlayerImageTable row={row} />
                        {/* <img src={row.photo_url} className="w-7 h-7 rounded-lg object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/1e293b/a5b4fc?text=FC'; }} alt={row.name} /> */}
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-emerald-400">{row.points}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{row.matches_played}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{row.wins}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{row.draws}</td>
                    <td className="py-3 px-4 text-center text-slate-300">{row.losses}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{row.goals_for}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{row.goals_against}</td>
                    <td className={`py-3 px-4 text-center font-bold ${sg > 0 ? 'text-emerald-400' : sg < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {sg > 0 ? `+${sg}` : sg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matches */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <i className="fa-solid fa-circle-play text-indigo-400" /> Partidas &amp; Rodadas
          </h3>
          <select
            value={selectedRound}
            onChange={e => setSelectedRound(parseInt(e.target.value))}
            className="bg-slate-900 text-xs border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-300"
          >
            {rounds.map(r => <option key={r} value={r}>Rodada {r}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {matches.map(m => (
            <div key={m.id} className="bg-slate-900 border border-slate-700/70 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-2">
                <span>PARTIDA ID: {m.id}</span>
                <span className={`font-bold uppercase ${m.played ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {m.played ? 'Encerrado' : 'Agendado'}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4 flex flex-col items-center text-center space-y-1">
                  <PlayerImageMatch photo_url={m.home_photo} />
                  {/* <img src={m.home_photo ?? ''} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }} alt="" /> */}
                  <span className="text-xs font-bold text-slate-200 line-clamp-1">{m.home_name}</span>
                </div>
                <div className="col-span-4 flex flex-col items-center justify-center">
                  {m.played ? (
                    <div className="flex items-center space-x-3 text-lg font-black text-white bg-slate-800 py-1.5 px-4 rounded-xl border border-slate-700">
                      <span>{m.home_score}</span>
                      <span className="text-xs text-slate-500">X</span>
                      <span>{m.away_score}</span>
                      <button onClick={() => resetScore(m.id)} className="ml-2 text-xs text-indigo-400 hover:text-indigo-300" title="Editar resultado">
                        <i className="fa-solid fa-pen-to-square" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input type="number" min="0" value={scores[m.id]?.home ?? ''}
                        onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], home: e.target.value } }))}
                        className="w-12 text-center bg-slate-950 border border-slate-700 rounded-lg py-1 font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="0" />
                      <span className="text-xs text-slate-500">X</span>
                      <input type="number" min="0" value={scores[m.id]?.away ?? ''}
                        onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], away: e.target.value } }))}
                        className="w-12 text-center bg-slate-950 border border-slate-700 rounded-lg py-1 font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="0" />
                      <button onClick={() => saveScore(m.id)} className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-1.5 rounded-lg transition" title="Confirmar placar">
                        <i className="fa-solid fa-check text-xs font-bold" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="col-span-4 flex flex-col items-center text-center space-y-1">
                  <PlayerImageMatch photo_url={m.away_photo} />
                  {/* <img src={m.away_photo ?? ''} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }} alt="" /> */}
                  <span className="text-xs font-bold text-slate-200 line-clamp-1">{m.away_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProfileChampionship open={openModalChampionship} playerStanding={standingSelectedPlayer} />
    </div>
  );
}
