'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

export function CreateChampionshipModal() {
  const { isModalOpen, setModalOpen, showToast, switchTab, addQueryLog } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<'pontos_corridos' | 'mata_mata'>('pontos_corridos');
  const [players, setPlayers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadPlayers = useCallback(async () => {
    try {
      const data = await apiClient<{ players: User[] }>('/api/players');
      setPlayers(data.players);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      loadPlayers();
      setName('');
      setType('pontos_corridos');
      setSelected(new Set());
    }
  }, [isModalOpen, loadPlayers]);

  function togglePlayer(id: number) {
    setSelected(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (type === 'pontos_corridos' && selected.size < 2) {
      showToast('Seleção Inválida', 'Selecione pelo menos 2 participantes para pontos corridos.', 'error');
      return;
    }
    if (type === 'mata_mata' && ![2, 4, 8, 16].includes(selected.size)) {
      showToast('Chaveamento Inválido', 'Mata-Mata requer exatamente 2, 4, 8 ou 16 participantes.', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient<{ id: number }>('/api/championships', {
        method: 'POST',
        body: JSON.stringify({ name, type, playerIds: Array.from(selected) }),
      });
      addQueryLog('INSERT CHAMPIONSHIP', `INSERT INTO championships (name, type) VALUES ('${name}', '${type}'); ID: ${data.id}`);
      showToast('Campeonato Criado', `O torneio "${name}" foi iniciado!`, 'success');
      setModalOpen(false);
      switchTab('championships');
    } catch (err) {
      showToast('Erro ao Criar', (err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!isModalOpen) return null;

  const selectionRule = type === 'pontos_corridos'
    ? 'Para Pontos Corridos selecione no mínimo 2 participantes.'
    : 'Para Mata-Mata selecione exatamente 2, 4, 8 ou 16 jogadores (árvore perfeita).';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            <i className="fa-solid fa-trophy text-emerald-400 mr-2" />Novo Campeonato
          </h3>
          <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition">
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Nome do Torneio</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="ex: Copa dos Campeões 2026" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Tipo de Campeonato</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'pontos_corridos', label: 'Pontos Corridos', sub: 'Todos jogam contra todos', icon: 'fa-solid fa-ranking-star' },
                { value: 'mata_mata', label: 'Mata-Mata', sub: 'Eliminatória em chaveamento', icon: 'fa-solid fa-sitemap' },
              ] as const).map(opt => (
                <label key={opt.value}
                  className={`bg-slate-900 border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition ${type === opt.value ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-700'}`}>
                  <input type="radio" name="champ-type" value={opt.value} checked={type === opt.value}
                    onChange={() => setType(opt.value)} className="hidden" />
                  <i className={`${opt.icon} text-2xl mb-2 ${type === opt.value ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="font-bold text-slate-200 text-sm">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 text-center mt-1">{opt.sub}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-300">Selecione os Participantes</label>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                {selected.size} Selecionados
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{selectionRule}</p>
            <div className="bg-slate-950 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 border border-slate-800">
              {players.length === 0 ? (
                <p className="text-xs text-rose-400 p-2">Nenhum jogador encontrado. Crie outros usuários primeiro!</p>
              ) : players.map(p => (
                <label key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 cursor-pointer transition border border-slate-800 hover:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <img src={p.photo_url} className="w-8 h-8 rounded-lg object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/1e293b/a5b4fc?text=FC'; }} alt={p.name} />
                    <span className="text-sm font-semibold text-slate-200">{p.name}</span>
                  </div>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => togglePlayer(p.id)}
                    className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500 bg-slate-800" />
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-trophy" /> Gerar Campeonato &amp; Chaveamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
