'use client';

import { useEffect, useRef, useState } from "react";
import ScanTeam from "./scan";
import { Card } from "@/types";
import { formations } from "@/constants";

export default function Profile() {
    const [openaScanModal, isOpenScanModal] = useState<boolean>(false);
    const [team, setImportTeam] = useState<{
        players: Card[];
        training: string
        tactical_setup: string
    } | undefined>();
    const pitchPlayersContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(function () {
        console.log(team);
    }, [team])

    return (
        <section id="tab-perfil" className="tab-content space-y-6">


            <div className="relative bg-gradient-to-r from-[#0d1527] via-[#0f172a] to-[#1a1226] border border-slate-800 rounded-2xl p-6 overflow-hidden shadow-xl">

                <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>


                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-900/90 text-slate-200 border border-slate-700/80 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        NÍVEL DE PERFIL: <span className="text-emerald-400 font-extrabold ml-1">PRO PLAYER</span>
                    </span>
                </div>


                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
                    <div className="flex items-center gap-5">

                        <div className="relative group">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700/80 shadow-xl flex-shrink-0">
                                <img id="profile-avatar" src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&amp;fit=crop&amp;q=80&amp;w=300" alt="Chow Chow Avatar" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute bottom-1 right-1 p-1.5 bg-slate-900/90 hover:bg-emerald-600 text-white rounded-lg border border-slate-700 text-xs transition shadow" title="Alterar foto">
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        </div>


                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2" id="profile-name">Alicio Junior <i className="fa-solid fa-circle-check text-emerald-400 text-lg" title="Jogador Verificado"></i></h1>
                            <div className="text-sm text-slate-400 font-mono" id="profile-handle">@licinho</div>


                            <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-xs italic">
                                "<span id="profile-quote">Tiki-taka no joystick e foco total na taça.</span>"
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                        <button type="button" onClick={(e) => {
                            e.preventDefault();

                            isOpenScanModal(true);
                        }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20">
                            <i className="fa-solid fa-camera-retro text-sm"></i>
                            Escanear Foto / Escalação
                        </button>

                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition">
                            <i className="fa-solid fa-print"></i>
                            Exportar Perfil
                        </button>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


                <div className="glow-card bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gols Marcados</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                            <i className="fa-solid fa-shirt"></i>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-extrabold text-white" id="stat-gols-marcados">27</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1" id="stat-media-gols">Média: 5.4 Gols / jogo</div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/5 rounded-full pointer-events-none"></div>
                </div>


                <div className="glow-card bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gols Sofridos</span>
                        <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-extrabold text-white" id="stat-gols-sofridos">0</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1" id="stat-saldo-gols">Saldo de Gols: 27</div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-red-500/5 rounded-full pointer-events-none"></div>
                </div>


                <div className="glow-card bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campeonatos</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
                            <i className="fa-solid fa-trophy"></i>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-extrabold text-white" id="stat-campeonatos">1</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1">Torneios participados</div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-500/5 rounded-full pointer-events-none"></div>
                </div>


                <div className="glow-card bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Despromoções</span>
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <i className="fa-solid fa-circle-arrow-down"></i>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-extrabold text-white" id="stat-despromocoes">0</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1">Nível estável na liga</div>
                    </div>
                </div>
            </div>


            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏅</span>
                    <h2 className="text-lg font-bold text-white">Insígnias do Jogador</h2>
                </div>
                <p className="text-xs text-slate-400 -mt-2">Conquistas especiais desbloqueadas ao cumprir objetivos no relvado.</p>

                <div id="badges-container" className="py-6 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-[#080d18]/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full p-2">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 text-lg">
                                <i className="fa-solid fa-shield-cat"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-xs">IA Lineup Master</h4>
                                <p className="text-[10px] text-slate-400">Escaneou e posicionou com sucesso o time no campo tático.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400 text-lg">
                            <i className="fa-solid fa-trophy"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-white">Sala dos Troféus Virtuais</h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700" id="trophy-count">0 Conquistas</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Galeria histórica contendo todas as taças e campeonatos vencidos por este pro-player ao longo das épocas.</p>
                        </div>
                    </div>
                </div>

                <div id="trophies-container" className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="col-span-full py-8 text-center text-slate-500 text-xs bg-[#080d18]/30 rounded-xl border border-slate-800/60">
                        Nenhum troféu conquistado até o momento.
                    </div>
                </div>
            </div>


            <div id="imported-squad-section" className="bg-[#0f172a] border border-emerald-500/30 rounded-2xl p-6 space-y-6">


                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-lg">
                            <i className="fa-solid fa-users-viewfinder"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Escalação Tática e Análise do Elenco
                                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">IA Scanner</span>
                            </h2>
                            <p className="text-xs text-slate-400">Atletas e comportamento tático extraídos no escaneamento do time.</p>
                        </div>
                    </div>
                    <button className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5 font-semibold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition">
                        <i className="fa-solid fa-rotate"></i> Re-Escanear
                    </button>
                </div>


                <div id="tactical-info-panel" className="bg-gradient-to-r from-[#080d18] via-[#0b1326] to-[#080d18] border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3.5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
                                <i className="fa-solid fa-clipboard-user text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    Disposição Tática e Esquema
                                    <span id="tactical-formation-badge" className="px-2.5 py-0.5 rounded text-xs font-mono font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-700 shadow-sm">4-3-3 Ofensivo</span>
                                </h3>
                                <p className="text-xs text-slate-400">Resumo do esquema tático e estilo de jogo do elenco antes da entrada em campo.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-[#0f172a] px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-sm">
                            <span className="text-xs font-medium text-slate-400">OVR Médio do Elenco:</span>
                            <span id="tactical-avg-ovr" className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm">87.7</span>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="bg-[#0f172a]/90 hover:border-emerald-500/30 transition border border-slate-800/80 p-4 rounded-xl space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                <span>Esquema Tático</span>
                                <i className="fa-solid fa-sitemap text-emerald-400 text-sm"></i>
                            </div>
                            <div className="text-base font-extrabold text-white" id="info-esquema-formacao">4-3-3 Ofensivo</div>
                            <p className="text-xs text-slate-400" id="info-esquema-sub">3 Atletas em campo • Disposição Ativa</p>
                        </div>


                        <div className="bg-[#0f172a]/90 hover:border-amber-500/30 transition border border-slate-800/80 p-4 rounded-xl space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                <span>Disposição Tática</span>
                                <i className="fa-solid fa-bolt text-amber-400 text-sm"></i>
                            </div>
                            <div className="text-base font-extrabold text-white" id="info-disposicao-tipo">Pressão Alta (Gegenpressing)</div>
                            <p className="text-xs text-slate-400" id="info-disposicao-sub">Recuperação &amp; linhas avançadas</p>
                        </div>
                    </div>
                </div>


                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <i className="fa-solid fa-[#10b981] fa-futbol text-emerald-400"></i> Disposição 2D no Relvado
                        </span>
                        <span className="text-[11px] text-slate-500">Passe o cursor sobre os atletas para ampliar</span>
                    </div>

                    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[600px] rounded-2xl overflow-hidden border-2 border-emerald-900/60 shadow-2xl football-pitch p-4 flex flex-col justify-between">


                        <div className="absolute inset-3 border-2 border-white/20 rounded-lg pointer-events-none">

                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/5 border-b-2 border-x-2 border-white/20 rounded-b-md"></div>

                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-1/12 border-b-2 border-x-2 border-white/20 rounded-b-sm"></div>

                            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/20 -translate-y-1/2"></div>

                            <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 border-2 border-white/20 rounded-full"></div>

                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/5 border-t-2 border-x-2 border-white/20 rounded-t-md"></div>

                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-1/12 border-t-2 border-x-2 border-white/20 rounded-t-sm"></div>
                        </div>
                        <div id="pitch-players-container" className="relative w-full h-full z-10" ref={pitchPlayersContainerRef}>
                            {
                                team &&
                                formations.filter(x => x.name == team?.training)[0].positions.map(x => {
                                    var players = team.players.filter(p => x.includes(p.name))
                                    return (
                                        <>
                                            {/* {
                                                x.map(p => (
                                                    <div
                                                        className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group player-pin"
                                                        style={{
                                                            bottom: `${pitchPlayersContainerRef.current!.offsetHeight - (pitchPlayersContainerRef.current!.offsetHeight * 0.8)}px`,
                                                            left: `${(pitchPlayersContainerRef.current!.offsetWidth / 3) * 0.5}px`
                                                        }}
                                                    >
                                                        <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-lg text-emerald-400 font-extrabold text-xs sm:text-sm group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                                                            <span>{x.overall}</span>
                                                            <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-[9px] font-bold">
                                                                {x.position}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 px-2 py-0.5 bg-slate-950/90 text-white text-[10px] sm:text-xs font-semibold rounded border border-slate-700/80 whitespace-nowrap shadow-md">
                                                            {x.name}
                                                        </div>
                                                    </div>
                                                ))
                                            } */}
                                        </>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

            </div>
            <ScanTeam openModal={openaScanModal} isOpenModal={isOpenScanModal} setImportTeam={setImportTeam}></ScanTeam>
        </section>
    )
}