'use client';

import { useApp } from '@/contexts/AppContext';
import { TabId } from '@/types';

const NAV_ITEMS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard',     label: 'Início',    icon: 'fa-solid fa-house' },
  { id: 'championships', label: 'Torneios',  icon: 'fa-solid fa-trophy' },
  { id: 'profiles',      label: 'Jogadores', icon: 'fa-solid fa-users' },
  { id: 'console',       label: 'Console',   icon: 'fa-solid fa-terminal' },
];

export function MobileNav() {
  const { currentUser, activeTab, switchTab } = useApp();

  if (!currentUser) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-lg border-t border-slate-700/60 z-40 py-2 px-6 flex justify-around items-center shadow-2xl">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => switchTab(item.id)}
          className={`flex flex-col items-center transition ${
            activeTab === item.id ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          <i className={`${item.icon} text-lg`} />
          <span className="text-[10px] mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
