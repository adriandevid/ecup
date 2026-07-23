'use client';

import { cn } from "@/lib/tailwindcss";
import { PlayerStanding } from "@/types";
import { useEffect, useState } from "react";

enum Filter {
    all,
    closed,
    opend
}

export default function ProfileChampionship({ open, playerStanding }: { open: boolean; playerStanding: PlayerStanding | undefined }) {
    const [isOpenModal, showModal] = useState<boolean>(open);
    const [playerStandingData, setPlayerStandingData] = useState(playerStanding);
    const [typeFilter, setTypeFilter] = useState<Filter>(Filter.all);

    useEffect(function () {
        setPlayerStandingData(playerStanding);
    }, [playerStanding]);

    const loadMatches = () => {
        if(playerStandingData == undefined) {
            return []
        }

        switch (typeFilter) {
            case Filter.all:
                return playerStandingData?.matches;
            case Filter.closed:
                return playerStandingData?.matches.filter(x => x.played);
            case Filter.opend:
                return playerStandingData?.matches.filter(x => !x.played);
            default:
                return [];
        }
    }

    if (!isOpenModal && playerStandingData == undefined) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-[50rem] w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
                <div className="p-5 md:p-6 bg-[#131C2E] border-b border-slate-800/80 relative">
                    <button onClick={() => {
                        showModal(false);
                        setPlayerStandingData(undefined);
                    }} id="closeModalBtn" className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="relative">
                            <img id="modalPlayerAvatar" src={playerStandingData?.photo_url} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/50 bg-slate-900 shadow-md" />
                            <span id="modalPlayerPos" className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded-full ring-2 ring-[#131C2E]">
                                #{playerStandingData?.position}
                            </span>
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <img id="modalPlayerFlag" src={playerStandingData?.photo_url} className="w-6 h-4 object-cover rounded shadow-sm" alt="Nação" />
                                <h3 id="modalPlayerName" className="text-xl font-black text-white tracking-tight">{playerStandingData?.name}</h3>
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                                    Jogador Selecionado
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Histórico completo de partidas e desempenho neste torneio</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-5 pt-4 border-t border-slate-800/60 text-center">
                        <div className="bg-[#1A253C]/80 rounded-xl p-2 border border-slate-800">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Pontos</span>
                            <span id="statP" className="text-base font-extrabold text-emerald-400">{playerStandingData?.points}</span>
                        </div>
                        <div className="bg-[#1A253C]/80 rounded-xl p-2 border border-slate-800">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Jogos</span>
                            <span id="statJ" className="text-base font-bold text-white">{playerStandingData?.matches_played}</span>
                        </div>
                        <div className="bg-[#1A253C]/80 rounded-xl p-2 border border-slate-800">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Vitórias</span>
                            <span id="statV" className="text-base font-bold text-emerald-400">{playerStandingData?.wins}</span>
                        </div>
                        <div className="bg-[#1A253C]/80 rounded-xl p-2 border border-slate-800">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Empates</span>
                            <span id="statE" className="text-base font-bold text-amber-400">{playerStandingData?.draws}</span>
                        </div>
                        <div className="bg-[#1A253C]/80 rounded-xl p-2 border border-slate-800">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Derrotas</span>
                            <span id="statD" className="text-base font-bold text-rose-400">{playerStandingData?.losses}</span>
                        </div>
                        <div className="bg-[#1A253C]/80 rounded-xl p-2 border border-slate-800">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">GP / GC</span>
                            <span id="statG" className="text-base font-bold text-slate-200">{playerStandingData?.goals_for} - {playerStandingData?.goals_against}</span>
                        </div>
                        <div className="bg-[#1A253C]/80 rounded-xl p-2 border border-slate-800">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Saldo</span>
                            <span id="statSG" className="text-base font-bold text-emerald-400">
                                {
                                    playerStandingData?.goals_for != undefined && playerStandingData?.goals_against != undefined ?
                                        (playerStandingData?.goals_for - playerStandingData?.goals_against) > 0 ?
                                            `+${playerStandingData?.goals_for - playerStandingData?.goals_against}` :
                                            `${playerStandingData?.goals_for - playerStandingData?.goals_against}` : "0"
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-[#0F1623] border-b border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5" id="matchFilterTabs">
                        <button onClick={() => { setTypeFilter(Filter.all); }} data-filter="all" className={cn("px-3 py-1.5 rounded-lg text-xs font-bold", typeFilter == Filter.all ? "filter-btn active bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all" : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent transition-all")}>
                            Todas (<span id="countAll">{playerStandingData?.matches.length}</span>)
                        </button>
                        <button onClick={() => { setTypeFilter(Filter.closed); }} data-filter="ENCERRADO" className={cn("px-3 py-1.5 rounded-lg text-xs font-bold", typeFilter == Filter.closed ? "filter-btn active bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all" : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent transition-all")}>
                            Encerradas (<span id="countEncerradas">{playerStandingData?.matches_played}</span>)
                        </button>
                        <button onClick={() => { setTypeFilter(Filter.opend); }} data-filter="AGENDADO" className={cn("px-3 py-1.5 rounded-lg text-xs font-bold", typeFilter == Filter.opend ? "filter-btn active bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all" : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent transition-all")}>
                            Agendadas (<span id="countAgendadas">{playerStandingData?.matches_played ? playerStandingData?.matches.length - playerStandingData?.matches_played : playerStandingData?.matches.length}</span>)
                        </button>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                        <i className="fa-solid fa-futbol text-emerald-400 mr-1"></i> Partidas Relacionadas
                    </span>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#0B0F17]" id="modalMatchesList">
                    {
                        loadMatches().map(matche => (
                            <div key={matche.id} className="bg-[#162032] border border-slate-800/80 rounded-xl p-4 space-y-3 relative hover:border-slate-700 transition-all shadow-md">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-400 tracking-wider uppercase">PARTIDA ID: {matche.id}</span>
                                    {
                                        matche.played ?
                                            <span className="px-2 py-0.5 rounded-full border text-[10px] uppercase font-black tracking-wider bg-green-400/10 text-green-400 border-green-400/20">
                                                ENCERRADO
                                            </span> :
                                            <span className="px-2 py-0.5 rounded-full border text-[10px] uppercase font-black tracking-wider bg-amber-400/10 text-amber-400 border-amber-400/20">
                                                AGENDADO
                                            </span>
                                    }
                                </div>

                                <div className="flex items-center justify-between gap-2 py-1">
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0 ">
                                        <img src={matche.home_photo} className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500 ring-2 ring-emerald-500/30 flex-shrink-0" alt={matche.home_name} />
                                        <span className={cn("text-xs font-bold truncate", matche.home_user_id == playerStanding?.pid ? "text-emerald-400 font-extrabold" : "text-slate-200")}>{matche.home_name}</span>
                                    </div>

                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0F1623] rounded-lg border border-slate-800 flex-shrink-0 font-extrabold text-sm">
                                        <span className="text-slate-200">{matche.home_score}</span>
                                        <span className="text-slate-500 text-xs font-normal">x</span>
                                        <span className="text-slate-200">{matche.away_score}</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right text-emerald-400 font-bold">
                                        <span className={cn("text-xs font-bold truncate", matche.away_user_id == playerStanding?.pid ? "text-emerald-400 font-extrabold" : "text-slate-200")}>{matche.away_name}</span>
                                        <img src={matche.away_photo} className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500 ring-2 ring-emerald-500/30 flex-shrink-0" alt={matche.away_name} />
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className="p-4 bg-[#131C2E] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Exibindo confrontos diretos
                    </span>
                    <button onClick={() => {
                        showModal(false);
                        setPlayerStandingData(undefined);
                    }} id="closeModalFooterBtn" className="px-5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-[#1A253C] hover:bg-slate-700 border border-slate-700 transition-all">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}