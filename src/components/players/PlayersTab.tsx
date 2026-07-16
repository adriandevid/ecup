'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { PlayerStats } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/tailwindcss';

function IconPlayer({ u }: { u: PlayerStats }) {
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

function PlayersTab2() {
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

    const [playerSelected, selectPlayer] = useState<PlayerStats | undefined>();

    useEffect(function () {
        if (players.length > 0) {
            selectPlayer(players[0])
        }
    }, [players])

    console.log(playerSelected);

    return (
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
                <div className="bg-[#0b111e] rounded-2xl border border-borderBlue p-4">
                    <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-accentGreen rounded-full inline-block"></span>
                        Lista de Jogadores
                    </h2>
                    <p className="text-xs text-slate-400 mb-4">Escolha um jogador para inspecionar conquistas.</p>

                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1" id="players-list">
                        {
                            players.map(x => (
                                <button key={x.id} onClick={() => selectPlayer({ ...x })} className={cn("w-full text-left p-3.5 rounded-xl border bg-cardHover shadow-md shadow-emerald-500/5 transition-all flex items-center justify-between gap-3 group", playerSelected != undefined && x.id == playerSelected!.id ? 'border-accentGreen' : 'border-borderBlue')}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#18243c] flex items-center justify-center text-lg shrink-0 border border-borderBlue group-hover:scale-105 transition-transform">
                                            ⚽
                                        </div>
                                        <div className="leading-none">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-bold text-sm text-white group-hover:text-accentGreen transition-colors">{x.name}</h4>
                                                <div className="w-6 h-4 inline-flex rounded overflow-hidden border border-white/20">
                                                    <div className="w-1/3 bg-blue-600 h-full"></div>
                                                    <div className="w-1/3 bg-white h-full"></div>
                                                    <div className="w-1/3 bg-red-600 h-full"></div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400">@{x.username}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-bold text-accentGreen block">{x.goals} G</span>
                                        <span className="text-[9px] text-slate-500 block">{x.matches_played} Jogos</span>
                                    </div>
                                </button>
                            ))
                        }
                    </div>
                </div>

                <div className="bg-gradient-to-br from-cardBg to-[#112440] rounded-2xl border border-borderBlue p-4 relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 opacity-10 text-white font-black text-8xl">🏆</div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-accentGreen mb-1">Ecup Pro League</h3>
                    <p className="text-lg font-bold text-white">Temporada Ativa 4</p>
                    <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
                        <span>Líder da Época:</span>
                        <span className="text-white font-bold flex items-center gap-1">
                            🏆 Idel
                        </span>
                    </div>
                    <div className="w-full bg-[#090d16] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-accentGreen h-full rounded-full" style={{ width: '78%' }}></div>
                    </div>
                </div>
            </aside>

            {
                playerSelected && (
                    <section className="flex-grow flex flex-col gap-6" id="dashboard-content">
                        <div className="bg-[#0b111e] rounded-3xl border border-borderBlue overflow-hidden shadow-xl shadow-black/20">
                            <div className="h-32 bg-gradient-to-r from-emerald-600/20 via-blue-900/30 to-red-600/20 relative flex items-end p-6 border-b border-borderBlue">
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] text-slate-300 tracking-wider font-semibold uppercase">
                                    Nível de Perfil: Pro Player
                                </div>
                            </div>

                            <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-12">
                                <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
                                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-cardBg bg-[#131d32] shadow-xl flex items-center justify-center p-1" id="active-avatar-container">
                                        <img src={playerSelected.photo_url} alt="" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                            <h2 className="text-2xl font-extrabold text-white tracking-tight" id="active-name">{playerSelected.name}</h2>
                                            <div id="active-flag-container">
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400" id="active-handle">@{playerSelected.username}</p>
                                        <p className="text-xs italic text-accentGreen/90 bg-accentGreen/5 px-3 py-1.5 rounded-xl border border-accentGreen/10 inline-block mt-2" id="active-quote">
                                            "{playerSelected.description}"
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => { }} className="bg-[#0d1527] hover:bg-cardHover border border-borderBlue text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                        Exportar Perfil
                                    </button>
                                    <button onClick={() => { }} className="bg-accentGreen hover:bg-emerald-400 text-darkBg px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        Simular Novo Golo
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                            <div className="bg-[#0b111e] rounded-2xl border border-borderBlue p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 shadow-lg">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Golos Marcados</span>
                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-accentGreen">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a2 2 0 002 2h3a1 1 0 011 1v3a2 2 0 01-2 2h-1a2 2 0 100 4h1a2 2 0 012 2v3a1 1 0 01-1 1h-3a2 2 0 00-2 2v1a2 2 0 11-4 0v-1a2 2 0 00-2-2H5a1 1 0 01-1-1v-3a2 2 0 00-2-2V9a2 2 0 002-2h3a2 2 0 002-2V4z" /></svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-extrabold text-white" id="stat-gols-marcados">{playerSelected.goals}</p>
                                <p className="text-[10px] text-slate-500 mt-1" id="stat-media-gols">Média: {Math.round(playerSelected.goals / playerSelected.matches_played)} golos / jogo</p>
                            </div>

                            <div className="bg-[#0b111e] rounded-2xl border border-borderBlue p-5 relative overflow-hidden group hover:border-red-500/50 transition-all duration-300 shadow-lg">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Golos Sofridos</span>
                                    <div className="bg-red-500/10 p-2 rounded-lg text-accentRed">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-extrabold text-white" id="stat-gols-sofridos">{playerSelected.goals_conceded}</p>
                                <p className="text-[10px] text-slate-500 mt-1" id="stat-saldo-gols">Saldo de golos: {playerSelected.goals - playerSelected.goals_conceded}</p>
                            </div>

                            <div className="bg-[#0b111e] rounded-2xl border border-borderBlue p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300 shadow-lg">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Campeonatos</span>
                                    <div className="bg-amber-500/10 p-2 rounded-lg text-accentGold">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4l-3 3H8l-3-3h4" /></svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-extrabold text-white" id="stat-campeonatos">{playerSelected.champs_count}</p>
                                {/* <p className="text-[10px] text-slate-500 mt-1" id="stat-torneios-participados">0Participação ativa</p> */}
                            </div>
                            <div className="bg-[#0b111e] rounded-2xl border border-borderBlue p-5 relative overflow-hidden group hover:border-slate-500/50 transition-all duration-300 shadow-lg">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-500/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Despromoções</span>
                                    <div className="bg-slate-500/10 p-2 rounded-lg text-slate-400">

                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" /></svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-extrabold text-white" id="stat-rebaixamentos">0</p>
                                <p className="text-[10px] text-slate-500 mt-1" id="stat-despromocoes-status">Nível estável na liga</p>
                            </div>

                        </div>

                        <div className="flex flex-row gap-4 w-full">

                            <div className="bg-[#0b111e] rounded-3xl border border-borderBlue p-6 lg:col-span-3 flex flex-col gap-4 w-full">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="text-accentGold">🎖️</span> Insígnias do Jogador
                                    </h3>
                                    <p className="text-xs text-slate-400">Conquistas especiais desbloqueadas ao cumprir objetivos no relvado.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="badges-container">
                                    <div className="p-3 rounded-2xl border border-amber-500/40 bg-[#17253d] flex items-center gap-3 transition-all opacity-100">
                                        <div className="w-12 h-12 rounded-xl bg-[#1b2b48] flex items-center justify-center text-2xl shrink-0 border border-white/5 relative">
                                            ⚽
                                            <span className="absolute -top-1 -right-1 text-xs text-accentGreen">✓</span>
                                        </div>
                                        <div className="leading-tight">
                                            <h4 className="font-extrabold text-sm text-white">Bota de Ouro</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Mais de 30 golos marcados na liga.</p>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl border border-amber-500/40 bg-[#17253d] flex items-center gap-3 transition-all opacity-100">
                                        <div className="w-12 h-12 rounded-xl bg-[#1b2b48] flex items-center justify-center text-2xl shrink-0 border border-white/5 relative">
                                            🛡️
                                            <span className="absolute -top-1 -right-1 text-xs text-accentGreen">✓</span>
                                        </div>
                                        <div className="leading-tight">
                                            <h4 className="font-extrabold text-sm text-white">Firme e Hirto</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Completar um torneio sem derrotas.</p>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl border border-amber-500/40 bg-[#17253d] flex items-center gap-3 transition-all opacity-100">
                                        <div className="w-12 h-12 rounded-xl bg-[#1b2b48] flex items-center justify-center text-2xl shrink-0 border border-white/5 relative">
                                            🎩
                                            <span className="absolute -top-1 -right-1 text-xs text-accentGreen">✓</span>
                                        </div>
                                        <div className="leading-tight">
                                            <h4 className="font-extrabold text-sm text-white">Senhor Hat-Trick</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Marcar 3 ou mais golos no mesmo jogo.</p>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl border border-amber-500/40 bg-[#17253d] flex items-center gap-3 transition-all opacity-100">
                                        <div className="w-12 h-12 rounded-xl bg-[#1b2b48] flex items-center justify-center text-2xl shrink-0 border border-white/5 relative">
                                            🚀
                                            <span className="absolute -top-1 -right-1 text-xs text-accentGreen">✓</span>
                                        </div>
                                        <div className="leading-tight">
                                            <h4 className="font-extrabold text-sm text-white">Intocável</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Zero despromoções na carreira ativa.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-b from-[#111a2e] to-[#0d1627] rounded-3xl border border-borderBlue p-6 flex flex-col gap-6 shadow-2xl">
                            <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#1e2d4a]/40 pb-5">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/25 shadow-lg shadow-amber-500/5">
                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v3c0 2.21 1.79 4 4 4h2.5c.74 1.86 2.32 3.18 4.28 3.45L12 21H8v2h8v-2h-4l-1.78-3.55c1.96-.27 3.54-1.59 4.28-3.45H17c2.21 0 4-1.79 4-4V7c0-1.1-.9-2-2-2zM5 10V7h2v3H5zm14 0h-2V7h2v3z"></path>
                                    </svg>
                                </div>
                                <div className="text-center md:text-left flex-grow">
                                    <h4 className="text-lg font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                                        Sala dos Troféus Virtuais
                                        <span className="text-xs bg-[#1e2d4a] text-slate-300 font-semibold px-2 py-0.5 rounded-full" id="trophy-count-badge">{playerSelected.championships != undefined && playerSelected.championships != null ? playerSelected.championships.split(',').length : 0} Conquistas</span>
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1">Galeria histórica contendo todas as taças e campeonatos vencidos por este pro-player ao longo das épocas.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 w-full" id="trophy-shelf">
                                {
                                    playerSelected.championships != undefined ?
                                        playerSelected.championships.split(',').map((x, index) => {
                                            console.log(x.toLowerCase().includes('inviolável'));

                                            if (x.toLowerCase().includes('vencedor')) {
                                                return (
                                                    <div key={index} className="trophy-card bg-gradient-to-b from-amber-600/20 via-amber-900/30 to-amber-500/10 border-amber-500/30 text-amber-400 border p-4 rounded-2xl text-center flex flex-col items-center justify-between min-h-[140px] shadow-lg hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-500/5" title="Champions Cup T1">
                                                        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0d1527] border border-white/5 mb-2 shadow-inner">
                                                            <span className="text-2xl filter drop-shadow animate-pulse">🏆</span>
                                                        </div>
                                                        <div className="leading-none mt-1 w-full">
                                                            <span className="text-[9px] uppercase font-black tracking-widest block opacity-90">Ouro</span>
                                                            <span className="text-[11px] text-white font-extrabold truncate w-full block mt-1.5" title="Champions Cup T1">{x}</span>
                                                            <span className="text-[9px] text-slate-400 block mt-1 font-medium">Temporada 1</span>
                                                        </div>
                                                    </div>
                                                )
                                            } else if (x.toLowerCase().includes('segundo')) {
                                                return (
                                                    <div key={index} className="trophy-card bg-gradient-to-b from-slate-400/20 via-slate-700/20 to-slate-500/10 border-slate-400/35 text-slate-300 border p-4 rounded-2xl text-center flex flex-col items-center justify-between min-h-[155px] shadow-lg hover:scale-105 hover:shadow-black/35 transition-all duration-300" title="Supercopa Ecup T4">
                                                        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0d1527] border border-white/5 mb-2 shadow-inner">
                                                            <span className="text-2xl filter drop-shadow">🥈</span>
                                                        </div>
                                                        <div className="leading-none mt-1 w-full flex flex-col items-center">
                                                            <span className="text-[9px] uppercase font-black tracking-widest block opacity-95">Vice (2º)</span>
                                                            <span className="text-[11px] text-white font-extrabold truncate w-full block mt-1.5" title="Supercopa Ecup T4">{x}</span>
                                                            <span className="text-[9px] text-slate-400 block mt-1 font-medium">Temporada 4</span>

                                                        </div>
                                                    </div>
                                                )
                                            } else if (x.toLowerCase().includes('terceiro')) {
                                                return (
                                                    <div key={index} className="trophy-card bg-gradient-to-b from-orange-800/10 via-orange-950/20 to-orange-900/5 border-orange-700/30 text-orange-400 border p-4 rounded-2xl text-center flex flex-col items-center justify-between min-h-[155px] shadow-lg hover:scale-105 hover:shadow-black/35 transition-all duration-300" title="Copa Regional T3">
                                                        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0d1527] border border-white/5 mb-2 shadow-inner">
                                                            <span className="text-2xl filter drop-shadow">🥉</span>
                                                        </div>

                                                        <div className="leading-none mt-1 w-full flex flex-col items-center">
                                                            <span className="text-[9px] uppercase font-black tracking-widest block opacity-95">3º Lugar</span>
                                                            <span className="text-[11px] text-white font-extrabold truncate w-full block mt-1.5" title="Copa Regional T3">{x}</span>
                                                            <span className="text-[9px] text-slate-400 block mt-1 font-medium">Temporada 3</span>

                                                        </div>
                                                    </div>
                                                )
                                            } else if (x.toLowerCase().includes('rebaixado')) {
                                                return (
                                                    <div key={index}  className="relegation-card bg-gradient-to-b from-red-950 via-red-900 to-black border-red-500 text-red-200 border-2 p-4 rounded-2xl text-center flex flex-col items-center justify-between min-h-[155px] shadow-2xl hover:scale-105 transition-all duration-300">
                                                        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#1b080b] border-2 border-red-500 shadow-inner mb-2">
                                                            <span className="text-3xl filter drop-shadow">💀</span>
                                                        </div>
                                                        <div className="leading-none mt-2 w-full">
                                                            <span className="text-[10px] uppercase font-black tracking-widest block text-red-400">Troféu Lanterna</span>
                                                            <span className="text-[12px] text-white font-extrabold block mt-1">{x}</span>
                                                            <div className="bg-red-600 text-white font-extrabold text-[10px] tracking-wider px-3 py-1 rounded-full mt-3 inline-block shadow-lg shadow-red-900/50">
                                                                Nível: 1
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            } else if(x.toLowerCase().includes('inviolável')) {
                                               return (
                                                 <div key={index} className="trophy-card bg-gradient-to-b from-slate-800/10 via-slate-900/10 to-slate-950/10 border-slate-700/20 text-slate-500 opacity-40 filter grayscale border p-4 rounded-2xl text-center flex flex-col items-center justify-between min-h-[155px] shadow-lg hover:scale-105 hover:shadow-black/35 transition-all duration-300" title="Medalha de Consistência">
                                                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0d1527] border border-white/5 mb-2 shadow-inner">
                                                        <span className="text-2xl filter drop-shadow">⚪</span>
                                                    </div>
                                                    <div className="leading-none mt-1 w-full flex flex-col items-center">
                                                        <span className="text-[9px] uppercase font-black tracking-widest block opacity-95">Meio Tabela</span>
                                                        <span className="text-[11px] text-white font-extrabold truncate w-full block mt-1.5" title="Medalha de Consistência">{x}</span>
                                                        <span className="text-[9px] text-slate-400 block mt-1 font-medium">Sem registos</span>
                                                        
                                                        <div className="bg-slate-800/30 text-slate-400 border border-slate-700/20 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full mt-2 inline-block">
                                                            Sem registos
                                                        </div>
                                                    
                                                    </div>
                                                </div>
                                               )
                                            }
                                            return (
                                                <div key={index} className="trophy-card dispute-card bg-gradient-to-b from-blue-600/15 via-blue-900/25 to-blue-950/5 border-dashed border-blue-500/30 text-blue-400 border p-4 rounded-2xl text-center flex flex-col items-center justify-between min-h-[155px] shadow-lg hover:scale-105 hover:shadow-black/35 transition-all duration-300" title="Ecup Masters T5">
                                                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0d1527] border border-white/5 mb-2 shadow-inner">
                                                        <span className="text-2xl filter drop-shadow">⚔️</span>
                                                        <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
                                                    </div>

                                                    <div className="leading-none mt-1 w-full flex flex-col items-center">
                                                        <span className="text-[9px] uppercase font-black tracking-widest block opacity-95">Em Disputa</span>
                                                        <span className="text-[11px] text-white font-extrabold truncate w-full block mt-1.5" title="Ecup Masters T5">{x}</span>
                                                        <span className="text-[9px] text-slate-400 block mt-1 font-medium">Em Disputa</span>
                                                    </div>
                                                </div>
                                            )
                                        }) : <></>
                                }
                            </div>
                        </div>
                    </section>
                )
            }
        </main>
    )
}