'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { PlayerStats } from '@/types';
import Image from 'next/image';

function IconPlayer({ u } : { u: PlayerStats }) {
  const [noLoadImage, setNoLoadImage] = useState<boolean>(false);

  return (
    <div key={u.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl text-center space-y-4 flex flex-col justify-between">
      <div className="flex flex-col items-center space-y-3">
        <Image
          src={u.photo_url == undefined || (u.photo_url != undefined && !u.photo_url.includes('jpg') && !u.photo_url.includes('png') && !u.photo_url.includes('jpeg')) || noLoadImage ? '/images/default_icon.png' : u.photo_url}
          className="rounded-2xl object-cover ring-2 ring-slate-800 w-16 h-16"
          width={64}
          height={64}
          alt={u.name}
          unoptimized
          decoding='async'
          onErrorCapture={() => {
            setNoLoadImage(true);
          }}
        />
        <div>
          <h3 className="font-bold text-white text-base">{u.name}</h3>
          <span className="text-xs text-slate-400 font-medium block">@{u.username}</span>
        </div>
        <p className="text-xs text-slate-400 font-medium italic min-h-[32px] max-w-[180px] line-clamp-2">
          &ldquo;{u.description || 'Disposto a vencer todos os campeonatos!'}&rdquo;
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-bold">
        <div>
          <span className="text-slate-500 block">TORNEIOS</span>
          <span className="text-emerald-400 font-extrabold text-sm">{u.champs_count}</span>
        </div>
        <div>
          <span className="text-slate-500 block">JOGOS</span>
          <span className="text-indigo-400 font-extrabold text-sm">{u.matches_played}</span>
        </div>
        <div>
          <span className="text-slate-500 block">GOLS</span>
          <span className="text-rose-400 font-extrabold text-sm">{u.goals}</span>
        </div>
      </div>
    </div>
  )
}

export function PlayersTab() {
  const { addQueryLog } = useApp();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<{ players: PlayerStats[] }>('/api/players');
      setPlayers(data.players);
      addQueryLog('LIST PLAYERS PROFILES', 'SELECT u.*, COUNT(cp), SUM(goals) FROM users u LEFT JOIN ...');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [addQueryLog]);

  useEffect(() => { loadPlayers(); }, [loadPlayers]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Galeria de Jogadores</h1>
          <p className="text-slate-400 text-sm">Explore os perfis individuais de todos os jogadores cadastrados no sistema.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-2" />
          <p className="text-sm">Carregando jogadores...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
          <i className="fa-solid fa-users text-4xl mb-3" />
          <p className="font-semibold">Nenhum jogador cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map((u, i) => (
            <IconPlayer key={i} u={u} />
          ))}
        </div>
      )}
    </div>
  );
}
