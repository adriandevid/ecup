'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { Championship } from '@/types';
import { RoundRobinView } from './RoundRobinView';
import { KnockoutView } from './KnockoutView';

export function ChampionshipsTab() {
  const { setModalOpen, showToast, addQueryLog, roleId } = useApp();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [activeChamp, setActiveChamp] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<{ championships: Championship[] }>('/api/championships');
      setChampionships(data.championships);
      addQueryLog('LIST CHAMPIONSHIPS', 'SELECT c.*, COUNT(cp) FROM championships c LEFT JOIN championship_players cp ORDER BY c.id DESC');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [addQueryLog]);

  useEffect(() => { loadList(); }, [loadList]);

  async function openTournament(id: number) {
    try {
      const data = await apiClient<{ championship: Championship }>(`/api/championships/${id}`);
      setActiveChamp(data.championship);
      addQueryLog('OPEN CHAMPIONSHIP', `SELECT * FROM championships WHERE id = ${id}`);
    } catch (err) { console.error(err); }
  }

  async function deleteChampionship() {
    if (!activeChamp) return;
    if (!confirm(`Deletar "${activeChamp.name}" permanentemente?`)) return;
    try {
      await apiClient(`/api/championships/${activeChamp.id}`, { method: 'DELETE' });
      addQueryLog('DELETE TOURNAMENT', `DELETE FROM championships WHERE id = ${activeChamp.id}`);
      showToast('Excluído', 'O torneio foi removido permanentemente.', 'info');
      setActiveChamp(null);
      await loadList();
    } catch (err) {
      showToast('Erro', (err as Error).message, 'error');
    }
  }

  if (activeChamp) {
    const isPontos = activeChamp.type === 'pontos_corridos';
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Tournament header */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-700/60 gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl shadow-lg ${isPontos ? 'bg-emerald-500 shadow-emerald-500/10' : 'bg-indigo-500 shadow-indigo-500/10'} text-slate-950`}>
                <i className={`${isPontos ? 'fa-solid fa-ranking-star' : 'fa-solid fa-sitemap'} text-2xl`} />
              </div>
              <div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isPontos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                  {isPontos ? 'Pontos Corridos' : 'Mata-Mata (Chaveamento)'}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">{activeChamp.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {
                roleId == 1 && (
                  <button onClick={deleteChampionship}
                    className="flex-1 md:flex-none bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold px-4 py-2 rounded-xl transition text-sm">
                    <i className="fa-solid fa-trash mr-1" /> Deletar Torneio
                  </button>
                )
              }
              <button onClick={() => setActiveChamp(null)}
                className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold px-4 py-2 rounded-xl transition text-sm">
                <i className="fa-solid fa-chevron-left mr-1" /> Voltar à Lista
              </button>
            </div>
          </div>

          {isPontos ? (
            <RoundRobinView champId={activeChamp.id} />
          ) : (
            <KnockoutView champId={activeChamp.id} onChampionCrowned={() => openTournament(activeChamp.id)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Central de Campeonatos</h1>
          <p className="text-slate-400 text-sm">Crie, gerencie e acompanhe os chaveamentos ou tabelas dos torneios ativos.</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2">
          <i className="fa-solid fa-circle-plus" /> Criar Campeonato
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-list text-emerald-400" /> Todos os Campeonatos Criados
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-2" />
            <p className="text-sm">Carregando...</p>
          </div>
        ) : championships.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-trophy text-5xl mb-3" />
            <h3 className="text-lg font-bold">Nenhum torneio em andamento</h3>
            <p className="text-xs text-slate-400 mt-1">Seja o primeiro a inaugurar o campo de jogo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {championships.map(c => {
              const isPontos = c.type === 'pontos_corridos';
              return (
                <div key={c.id} onClick={() => openTournament(c.id)}
                  className="bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 cursor-pointer transition flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isPontos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        {isPontos ? 'Pontos Corridos' : 'Mata-Mata'}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        <i className="fa-solid fa-users mr-1" /> {c.players_count}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-lg tracking-tight hover:text-emerald-400 transition">{c.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Clique para abrir resultados, tabelas e chaveamento.</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-800/85 mt-4 pt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${c.status === 'ativo' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'ativo' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {c.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                    </span>
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      Acessar <i className="fa-solid fa-arrow-right text-[10px]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
