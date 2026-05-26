'use client';

import { useApp } from '@/contexts/AppContext';

export function Toast() {
  const { toast } = useApp();

  const visible = toast !== null;

  const iconBgClass =
    toast?.type === 'success' ? 'bg-emerald-500 text-slate-950' :
    toast?.type === 'error'   ? 'bg-rose-500 text-slate-950 animate-bounce' :
                                'bg-indigo-500 text-slate-950';

  const iconClass =
    toast?.type === 'success' ? 'fa-solid fa-circle-check text-sm' :
    toast?.type === 'error'   ? 'fa-solid fa-circle-exclamation text-sm' :
                                'fa-solid fa-circle-info text-sm';

  return (
    <div
      className={`fixed top-5 right-[50%] z-50 bg-slate-800 border border-slate-700/80 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 max-w-md ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className={`p-2 rounded-lg ${iconBgClass}`}>
        <i className={iconClass} />
      </div>
      <div>
        <span className="font-bold text-sm text-white block">{toast?.title}</span>
        <span className="text-xs text-slate-300 block">{toast?.message}</span>
      </div>
    </div>
  );
}
