'use client';

import { useApp } from '@/contexts/AppContext';
import { TabId } from '@/types';
import Image from 'next/image';

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard',     label: 'Início',      icon: 'fa-solid fa-house' },
  { id: 'championships', label: 'Campeonatos', icon: 'fa-solid fa-trophy' },
  { id: 'profiles',      label: 'Jogadores',   icon: 'fa-solid fa-users' },
  { id: 'console',       label: 'Terminal SQL', icon: 'fa-solid fa-terminal' },
];

export function Header() {
  const { currentUser, activeTab, switchTab, logout, setUpdateProfileIsModalOpenState } = useApp();

  return (
    <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => currentUser && switchTab('dashboard')}
          className="flex items-center space-x-3"
        >
          <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <i className="fa-solid fa-ranking-star text-lg" />
          </div>
          <div>
            <span className="text-xl text-start font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Ecup
            </span>
            <span className="text-xs block text-slate-400 font-medium">Eletronic Cup</span>
          </div>
        </button>

        {currentUser && (
          <nav className="hidden md:flex space-x-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === item.id
                    ? 'bg-slate-700/50 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <i className={`${item.icon} mr-2`} />
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <div className="flex items-center space-x-3 group" onClick={() => setUpdateProfileIsModalOpenState(true)}>
                <Image
                  className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/80 transition"
                  src={currentUser.photo_url}
                  alt={currentUser.name}
                  width={36}
                  height={36}
                  unoptimized
                  decoding='async'
                  // onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }}
                />
                <div className="hidden sm:block text-left">
                  <span className="block text-sm font-semibold text-white">{currentUser.name}</span>
                  <span className="block text-[10px] text-slate-400">@{currentUser.username}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 bg-slate-700/50 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition"
                title="Sair do sistema"
              >
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
