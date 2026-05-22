'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';

export function ConsoleTab() {
  const { queryLogs, clearLogs, addQueryLog, showToast } = useApp();
  const [sql, setSql] = useState('SELECT * FROM users;');
  const [result, setResult] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function executeQuery() {
    if (!sql.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await apiClient<{ columns: string[]; rows: Record<string, unknown>[] }>('/api/console', {
        method: 'POST',
        body: JSON.stringify({ sql }),
      });
      setResult(data);
      addQueryLog('USER CONSOLE EXEC', sql);
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      addQueryLog('USER CONSOLE ERROR', msg);
      showToast('Erro na Query', msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            <i className="fa-solid fa-terminal mr-2 text-emerald-400" />Console SQL Interativo
          </h1>
          <p className="text-slate-400 text-sm">
            Veja o histórico de queries do sistema ou execute consultas SELECT personalizadas no PostgreSQL.
          </p>
        </div>
        <button onClick={clearLogs}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 px-4 rounded-xl text-sm transition">
          <i className="fa-solid fa-trash-can mr-2" />Limpar Histórico
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query executor */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-white text-base">Executar SQL Manual</h2>
          <p className="text-xs text-slate-400">
            Apenas consultas <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-pink-400">SELECT</code> são permitidas por segurança.
          </p>
          <textarea
            value={sql}
            onChange={e => setSql(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 font-mono text-sm text-emerald-400 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="SELECT * FROM users;"
          />
          <button onClick={executeQuery} disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold py-2 px-4 rounded-xl transition text-sm">
            <i className="fa-solid fa-play mr-2" />Rodar Query
          </button>

          {error && (
            <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 text-xs overflow-x-auto font-mono text-rose-400">
              Erro PostgreSQL: {error}
            </div>
          )}

          {result && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs overflow-x-auto max-h-48 font-mono text-emerald-400">
              {result.rows.length === 0 ? (
                <span>Comando executado com sucesso! Nenhuma linha retornada.</span>
              ) : (
                <table className="w-full text-left text-[11px] border border-slate-850">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      {result.columns.map(col => (
                        <th key={col} className="p-1.5 font-bold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i} className="border-b border-slate-900 hover:bg-slate-900/40">
                        {result.columns.map(col => (
                          <td key={col} className="p-1.5 text-slate-300">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex flex-col h-[500px]">
          <h2 className="font-bold text-white text-base mb-2">Logs de Query em Tempo Real</h2>
          <div className="flex-grow bg-slate-950 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-3 border border-slate-700/60">
            {queryLogs.length === 0 ? (
              <p className="text-slate-600 text-center pt-4">Nenhum log registrado ainda. Execute ações no sistema.</p>
            ) : queryLogs.map((log, i) => (
              <div key={i} className="border-b border-slate-900 pb-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-bold text-emerald-400">[{log.action}]</span>
                  <span>{log.timestamp}</span>
                </div>
                <pre className="whitespace-pre-wrap text-[11px] text-slate-300 font-mono select-all">{log.query}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
