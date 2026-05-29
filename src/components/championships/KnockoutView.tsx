'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { Match, Championship } from '@/types';

interface Props {
  champId: number;
  onChampionCrowned?: (name: string) => void;
}

type ViewMode = 'list' | 'tree';

const FALLBACK_PHOTO = 'https://placehold.co/80x80/1e293b/334155?text=?';

function getRoundTitle(rIndex: number, total: number) {
  const diff = total - rIndex;
  if (diff === 1) return 'Grande Final';
  if (diff === 2) return 'Semifinais';
  if (diff === 3) return 'Quartas de Final';
  if (diff === 4) return 'Oitavas de Final';
  return `Fase Eliminatória ${rIndex}`;
}

export function KnockoutView({ champId, onChampionCrowned }: Props) {
  const { showToast, addQueryLog, socket } = useApp();
  const [matches, setMatches] = useState<Match[]>([]);
  const [champInfo, setChampInfo] = useState<Championship | null>(null);
  const [maxRound, setMaxRound] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({});

  const loadData = useCallback(async () => {
    try {
      const [matchData, champData] = await Promise.all([
        apiClient<{ matches: Match[]; maxRound: number }>(`/api/championships/${champId}/matches`),
        apiClient<{ championship: Championship }>(`/api/championships/${champId}`),
      ]);

      setMatches(matchData.matches);
      setMaxRound(matchData.maxRound);
      setChampInfo(champData.championship);
      addQueryLog('RENDER BRACKETS', `SELECT m.*, u1.name, u2.name FROM matches LEFT JOIN users WHERE championship_id = ${champId} ORDER BY round ASC`);
    } catch (err) { console.error(err); }
  }, [champId, addQueryLog]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveScore(matchId: number) {
    const s = scores[matchId];
    if (!s) return;
    const home = parseInt(s.home);
    const away = parseInt(s.away);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      showToast('Erro de Placar', 'Digite um placar válido.', 'error');
      return;
    }
    try {
      const res = await apiClient<{ success: boolean; champion?: string }>(`/api/matches/${matchId}`, {
        method: 'PUT',
        body: JSON.stringify({ homeScore: home, awayScore: away }),
      });
      addQueryLog('KNOCKOUT SCORE', `UPDATE matches SET home_score=${home}, away_score=${away}, played=true WHERE id=${matchId}`);
      if (res.champion) {
        showToast('Temos um Campeão!', `${res.champion} conquistou o título!`, 'success');
        onChampionCrowned?.(res.champion);

        if(socket) {
          const match = matches.filter(x => x.id == matchId)[0];
          socket.emit('match-status', `${res.champion} conquistou o título do campeonato ${champInfo?.name} com o resultado final de ${match.home_score} a ${match.away_score}!`)
        }
      } else {
        if(socket) {
          const match = matches.filter(x => x.id == matchId)[0];
          socket.emit('match-status', `Resultado da partida entre ${match.home_name} e ${match.away_name} foi de ${match.home_score} a ${match.away_score}`)
        }
        showToast('Resultado Salvo', 'Vencedor avançado para próxima fase!', 'success');
      }
      setScores(prev => { const n = { ...prev }; delete n[matchId]; return n; });
      await loadData();
    } catch (err) {
      showToast('Erro', (err as Error).message, 'error');
    }
  }

  async function resetScore(matchId: number) {
    try {
      await apiClient(`/api/matches/${matchId}/reset`, { method: 'PUT' });
      addQueryLog('EDIT RESULT', `UPDATE matches SET played = false WHERE id = ${matchId}`);
      await loadData();
    } catch (err) { console.error(err); }
  }

  const roundMatches: Record<number, Match[]> = {};
  matches.forEach(m => {
    if (!roundMatches[m.round]) roundMatches[m.round] = [];
    roundMatches[m.round].push(m);
  });

  function MatchInputs({ m }: { m: Match }) {
    if (!m.home_user_id || !m.away_user_id) {
      return (
        <div className="text-center text-xs text-slate-500 py-2 bg-slate-950 border border-slate-800 rounded-xl">
          <i className="fa-solid fa-hourglass-half mr-1" /> Aguardando adversários
        </div>
      );
    }
    if (m.played) {
      return (
        <div className="flex items-center justify-center space-x-3 text-sm font-black text-white bg-slate-800 py-1.5 px-4 rounded-xl border border-slate-700">
          <span>{m.home_score}</span>
          <span className="text-xs text-slate-500">X</span>
          <span>{m.away_score}</span>
          <button onClick={() => resetScore(m.id)} className="ml-2 text-xs text-indigo-400 hover:text-indigo-300" title="Editar resultado">
            <i className="fa-solid fa-pen-to-square" />
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <input type="number" min="0" value={scores[m.id]?.home ?? ''}
          onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], home: e.target.value } }))}
          className="w-12 text-center bg-slate-900 border border-slate-700 rounded-lg py-1 font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="0" />
        <span className="text-xs text-slate-500">X</span>
        <input type="number" min="0" value={scores[m.id]?.away ?? ''}
          onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], away: e.target.value } }))}
          className="w-12 text-center bg-slate-900 border border-slate-700 rounded-lg py-1 font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="0" />
        <button onClick={() => saveScore(m.id)} className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-1.5 rounded-lg transition" title="Registrar Vencedor">
          <i className="fa-solid fa-check text-xs" />
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Champion banner */}
      {champInfo?.status === 'finalizado' && champInfo.winner_name && (
        <div className="mb-6 bg-gradient-to-r from-yellow-500/10 via-amber-500/20 to-yellow-500/10 border border-yellow-500/40 rounded-3xl p-6 text-center max-w-lg mx-auto shadow-xl animate-fade-in">
          <span className="bg-yellow-500 text-slate-950 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
            <i className="fa-solid fa-crown mr-1" /> Campeão do Torneio
          </span>
          <div className="mt-4 flex flex-col items-center">
            <div className="relative">
              <img src={champInfo.winner_photo ?? ''} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-yellow-400"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }} alt={champInfo.winner_name} />
              <div className="absolute -top-3 -right-3 bg-yellow-500 text-slate-950 p-2 rounded-full border-2 border-slate-900">
                <i className="fa-solid fa-trophy text-sm" />
              </div>
            </div>
            <h4 className="text-xl font-extrabold text-white mt-4">{champInfo.winner_name}</h4>
            <p className="text-xs text-yellow-400/80 font-medium mt-1">Glória eterna conquistada no FutChamp!</p>
          </div>
        </div>
      )}

      {/* View mode selector */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visualização:</span>
          <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-700/80 flex">
            {(['list', 'tree'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${viewMode === m ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                <i className={m === 'list' ? 'fa-solid fa-list-ol' : 'fa-solid fa-sitemap'} />
                {m === 'list' ? 'Lista de Partidas' : 'Chaveamento Árvore'}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          <i className="fa-solid fa-circle-info mr-1" /> Preencha os placares para avançar os atletas.
        </div>
      </div>

      {/* LIST MODE */}
      {viewMode === 'list' && (
        <div className="space-y-8 animate-fade-in">
          {Array.from({ length: maxRound }, (_, i) => i + 1).map(r => (
            <div key={r} className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-base tracking-wide uppercase flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  {getRoundTitle(r, maxRound)}
                </h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg font-bold">
                  {roundMatches[r]?.length ?? 0} {roundMatches[r]?.length === 1 ? 'confronto' : 'confrontos'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(roundMatches[r] ?? []).map(m => {
                  const hName = m.home_name ?? 'Aguardando definição';
                  const aName = m.away_name ?? 'Aguardando definição';
                  const hPhoto = m.home_photo ?? FALLBACK_PHOTO;
                  const aPhoto = m.away_photo ?? FALLBACK_PHOTO;
                  return (
                    <div key={m.id} className={`bg-slate-900 border rounded-2xl p-4 space-y-3 relative transition ${m.played ? 'border-emerald-500/40' : 'border-slate-800 hover:border-slate-700'}`}>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1.5">
                        <span>CONFRONTO ID: {m.id}</span>
                        <span className={`font-bold uppercase ${m.played ? 'text-emerald-400' : 'text-amber-400'}`}>{m.played ? 'Finalizado' : 'A Jogar'}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-2 items-center pt-2">
                        <div className="col-span-4 flex flex-col items-center text-center space-y-1">
                          <img src={hPhoto} className={`w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 ${m.played && (m.home_score ?? 0) < (m.away_score ?? 0) ? 'opacity-30' : ''}`}
                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO; }} alt={hName} />
                          <span className={`text-xs font-bold line-clamp-1 ${m.played && (m.home_score ?? 0) < (m.away_score ?? 0) ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{hName}</span>
                        </div>
                        <div className="col-span-4 flex flex-col items-center justify-center">
                          <MatchInputs m={m} />
                        </div>
                        <div className="col-span-4 flex flex-col items-center text-center space-y-1">
                          <img src={aPhoto} className={`w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 ${m.played && (m.away_score ?? 0) < (m.home_score ?? 0) ? 'opacity-30' : ''}`}
                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO; }} alt={aName} />
                          <span className={`text-xs font-bold line-clamp-1 ${m.played && (m.away_score ?? 0) < (m.home_score ?? 0) ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{aName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TREE MODE */}
      {viewMode === 'tree' && (
        <div className="overflow-x-auto pb-4 animate-scale-up">
          <div className="flex gap-8 justify-around items-stretch min-w-[750px] p-2">
            {Array.from({ length: maxRound }, (_, i) => i + 1).map(r => (
              <div key={r} className="flex-1 flex flex-col justify-around space-y-6 min-w-[220px]">
                <div className="text-center mb-2 bg-slate-900 border border-slate-700/50 py-2 rounded-xl text-xs font-bold text-slate-400 tracking-wide uppercase">
                  {getRoundTitle(r, maxRound)}
                </div>
                {(roundMatches[r] ?? []).map(m => {
                  const hName = m.home_name ?? 'Aguardando...';
                  const aName = m.away_name ?? 'Aguardando...';
                  const hPhoto = m.home_photo ?? FALLBACK_PHOTO;
                  const aPhoto = m.away_photo ?? FALLBACK_PHOTO;
                  return (
                    <div key={m.id} className={`bg-slate-900 border rounded-2xl p-3 flex flex-col space-y-2 relative shadow transition ${m.played ? 'border-emerald-500/40' : 'border-slate-700'}`}>
                      <span className="absolute right-2 top-0.5 text-[7px] text-slate-600">ID {m.id}</span>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={hPhoto} className={`w-6 h-6 rounded-lg object-cover ring-1 ring-slate-800 ${m.played && (m.home_score ?? 0) < (m.away_score ?? 0) ? 'opacity-30' : ''}`}
                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO; }} alt={hName} />
                          <span className={`text-xs font-bold line-clamp-1 ${m.played && (m.home_score ?? 0) < (m.away_score ?? 0) ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{hName}</span>
                        </div>
                        {m.played && (m.home_score ?? 0) > (m.away_score ?? 0) && <i className="fa-solid fa-check text-emerald-400 text-[10px]" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={aPhoto} className={`w-6 h-6 rounded-lg object-cover ring-1 ring-slate-800 ${m.played && (m.away_score ?? 0) < (m.home_score ?? 0) ? 'opacity-30' : ''}`}
                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO; }} alt={aName} />
                          <span className={`text-xs font-bold line-clamp-1 ${m.played && (m.away_score ?? 0) < (m.home_score ?? 0) ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{aName}</span>
                        </div>
                        {m.played && (m.away_score ?? 0) > (m.home_score ?? 0) && <i className="fa-solid fa-check text-emerald-400 text-[10px]" />}
                      </div>
                      {m.home_user_id && m.away_user_id ? (
                        m.played ? (
                          <div className="flex justify-between items-center text-sm font-bold bg-slate-800/60 p-1.5 rounded-lg border border-slate-700 mt-1">
                            <span className="pl-2 text-white">{m.home_score}</span>
                            <button onClick={() => resetScore(m.id)} className="text-[10px] text-slate-500 hover:text-indigo-400" title="Editar Placar">
                              <i className="fa-solid fa-pen" />
                            </button>
                            <span className="pr-2 text-white">{m.away_score}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1.5 mt-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <input type="number" min="0" value={scores[m.id]?.home ?? ''}
                              onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], home: e.target.value } }))}
                              className="w-10 text-center bg-slate-900 border border-slate-700 rounded py-1 font-bold text-sm text-white focus:outline-none" placeholder="0" />
                            <span className="text-[9px] font-bold text-slate-600">VS</span>
                            <input type="number" min="0" value={scores[m.id]?.away ?? ''}
                              onChange={e => setScores(p => ({ ...p, [m.id]: { ...p[m.id], away: e.target.value } }))}
                              className="w-10 text-center bg-slate-900 border border-slate-700 rounded py-1 font-bold text-sm text-white focus:outline-none" placeholder="0" />
                            <button onClick={() => saveScore(m.id)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-1.5 rounded transition">
                              <i className="fa-solid fa-check text-xs" />
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="text-center text-[10px] text-slate-500 py-1 bg-slate-950 border border-slate-800 rounded-xl mt-1">
                          Aguardando definição
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
