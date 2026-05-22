'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { DashboardStats, Championship } from '@/types';

export function DashboardTab() {
  const { currentUser, switchTab, setModalOpen, addQueryLog } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [championships, setChampionships] = useState<Championship[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [statsData, champsData] = await Promise.all([
        apiClient<DashboardStats>('/api/stats'),
        apiClient<{ championships: Championship[] }>('/api/championships'),
      ]);
      setStats(statsData);
      setChampionships(champsData.championships.slice(0, 4));
      addQueryLog('DASHBOARD STATS', 'SELECT COUNT(*) FROM championships, users, matches WHERE ...');
    } catch (err) {
      console.error(err);
    }
  }, [addQueryLog]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-950 border border-slate-700/60 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 text-slate-800/20 text-[180px] font-extrabold select-none pointer-events-none">FUT</div>
        <div className="space-y-2 z-10 max-w-xl text-center md:text-left">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
            Painel de Controle
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Olá, {currentUser?.name}! Pronto para o jogo?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Organize campeonatos em pontos corridos ou mata-mata, registre resultados em tempo real e gerencie perfis de jogadores.
          </p>
        </div>
        <div className="flex gap-3 z-10 w-full sm:w-auto justify-center">
          <button onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25">
            <i className="fa-solid fa-circle-plus" /> Novo Campeonato
          </button>
          <button onClick={() => switchTab('profiles')}
            className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-3 rounded-xl transition flex items-center justify-center gap-2">
            <i className="fa-solid fa-users" /> Ver Jogadores
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campeonatos Ativos',    value: stats?.activeChampionships ?? '–', valueCls: 'text-emerald-400', bgCls: 'bg-emerald-500/10 text-emerald-400', icon: 'fa-solid fa-trophy' },
          { label: 'Jogadores Cadastrados', value: stats?.totalPlayers ?? '–',        valueCls: 'text-indigo-400',  bgCls: 'bg-indigo-500/10 text-indigo-400',  icon: 'fa-solid fa-users' },
          { label: 'Partidas Disputadas',   value: stats?.matchesPlayed ?? '–',       valueCls: 'text-amber-400',   bgCls: 'bg-amber-500/10 text-amber-400',    icon: 'fa-solid fa-circle-play' },
          { label: 'Gols Marcados',         value: stats?.totalGoals ?? '–',          valueCls: 'text-rose-400',    bgCls: 'bg-rose-500/10 text-rose-400',      icon: 'fa-solid fa-futbol' },
        ].map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">{card.label}</span>
              <span className={`text-3xl font-black mt-1 block ${card.valueCls}`}>{card.value}</span>
            </div>
            <div className={`p-3 rounded-xl ${card.bgCls}`}>
              <i className={`${card.icon} text-2xl`} />
            </div>
          </div>
        ))}
      </div>

      {/* Championships + DB Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <i className="fa-solid fa-medal text-emerald-400" /> Seus Campeonatos
            </h2>
            <button onClick={() => switchTab('championships')} className="text-xs text-emerald-400 hover:underline">
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {championships.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700/60 rounded-xl">
                <i className="fa-solid fa-trophy text-3xl mb-2" />
                <p className="text-sm font-semibold">Nenhum campeonato criado ainda.</p>
                <button onClick={() => setModalOpen(true)}
                  className="mt-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition">
                  Começar Agora
                </button>
              </div>
            ) : championships.map(c => {
              const isPontos = c.type === 'pontos_corridos';
              return (
                <div key={c.id}
                  onClick={() => switchTab('championships')}
                  className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 flex items-center justify-between hover:border-slate-600 transition cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${isPontos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      <i className={isPontos ? 'fa-solid fa-ranking-star text-lg' : 'fa-solid fa-sitemap text-lg'} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                        {isPontos ? 'Pontos Corridos' : 'Mata-Mata'}
                      </span>
                      <h3 className="font-bold text-white text-sm sm:text-base">{c.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium block">{c.players_count} Atletas</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${c.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'ativo' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {c.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PostgreSQL info card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-database text-indigo-400" /> Info do Banco PostgreSQL
          </h2>
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 block uppercase">Motor de banco de dados</span>
              <p className="text-xs text-slate-300">Usando PostgreSQL com pool de conexões via <code className="bg-slate-950 px-1 rounded text-emerald-400">node-postgres (pg)</code>.</p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Tabelas criadas:</span>
                <span className="font-mono text-emerald-400 font-semibold">4 tabelas</span>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 block uppercase">Autenticação</span>
              <p className="text-xs text-slate-300">JWT via <code className="bg-slate-950 px-1 rounded text-emerald-400">jose</code> com expiração de 7 dias. Senha protegida com <code className="bg-slate-950 px-1 rounded text-emerald-400">bcrypt</code>.</p>
            </div>
            <button onClick={() => switchTab('console')}
              className="w-full bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 py-2 rounded-xl text-xs font-bold transition">
              <i className="fa-solid fa-terminal mr-1" /> Abrir Console SQL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
