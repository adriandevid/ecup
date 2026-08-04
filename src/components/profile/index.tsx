'use client';

import { useEffect, useRef, useState } from "react";
import ScanTeam from "./scan";
import { Card } from "@/types";
import { formations, positionsPtBr } from "@/constants";
import { cn } from "@/lib/tailwindcss";

export default function Profile() {
    const [openaScanModal, isOpenScanModal] = useState<boolean>(false);
    const [team, setImportTeam] = useState<{
        players: Card[];
        training: string
        tactical_setup: string
    } | undefined>();
    const pitchPlayersContainerRef = useRef<HTMLDivElement | null>(null);
    const [training, setTraining] = useState<string | undefined>();

    useEffect(function () {
        if (team && team.training != "") {
            var traningSource = formations.filter(x => x.name == team?.training)[0];
            if (traningSource) {
                setTraining(team?.training);
            }
        }
    }, [team])

    const [showTrainingCreateModal, isShowTrainingCreateModal] = useState<boolean>(false);

    const SelectPosition = () => (
        <select className="w-full bg-[#0f172a] border border-white rounded px-2 py-1 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none">
            {
                positionsPtBr.map((x, i) => (
                    <option value={x} key={i}>{x}</option>
                ))
            }
        </select>
    )


    const [taticalScheme, setTaticalScheme] = useState<{
        line: number,
        positions: string[]
    }[]>();

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


            <div id="imported-squad-section" className="bg-[#0f172a] border border-emerald-500/30 rounded-2xl p-6 space-y-6" style={{ display: team ? "" : 'none' }}>


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
                                    <span id="tactical-formation-badge" className="px-2.5 py-0.5 rounded text-xs font-mono font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-700 shadow-sm">{team?.training} {team?.tactical_setup}</span>
                                </h3>
                                <p className="text-xs text-slate-400">Resumo do esquema tático e estilo de jogo do elenco antes da entrada em campo.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-[#0f172a] px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-sm">
                            <span className="text-xs font-medium text-slate-400">OVR Total do Elenco:</span>
                            {
                                team && (
                                    <span id="tactical-avg-ovr" className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm">{team.players.map(x => x.overall).reduce((a, b) => a! + b!)!}</span>
                                )
                            }
                        </div>
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/90 hover:border-emerald-500/40 transition">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="fa-solid fa-sitemap text-emerald-400"></i> Esquema Tático
                                </span>
                                <button id="btnOpenCreateScheme" onClick={() => isShowTrainingCreateModal(true)} className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold transition flex items-center gap-1">
                                    <i className="fa-solid fa-plus text-[10px]"></i> Criar Esquema
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <select id="selectScheme" defaultValue={training} value={training} className="w-full bg-slate-800/90 text-white font-bold text-sm sm:text-base px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none">
                                        {
                                            formations.map(x => (
                                                <option value={x.name}>{x.name}</option>
                                            ))
                                        }
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-3 top-3.5 text-slate-400 text-xs pointer-events-none"></i>
                                </div>
                                <button id="btnDeleteCustomScheme" className="hidden text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg transition" title="Excluir Esquema Personalizado">
                                    <i className="fa-solid fa-trash-can text-sm"></i>
                                </button>
                            </div>
                            <p id="schemeDescription" className="text-[11px] text-slate-400 mt-2">2 Volantes, 2 Meias Laterais/Ofensivos e 2 Centroavantes.</p>
                        </div>

                        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/90 hover:border-emerald-500/40 transition">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="fa-solid fa-bolt text-amber-400"></i> Estilo de Jogo
                                </span>
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">Comportamento</span>
                            </div>
                            <div className="relative">
                                <select id="selectTacticalStyle" defaultValue={team?.tactical_setup} value={team?.tactical_setup} className="w-full bg-slate-800/90 text-white font-bold text-base px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none">
                                    <option value="Contra-ataque">Contra-ataque Rápido</option>
                                    <option value="Posse de bola">Posse de bola</option>
                                    <option value="Pressão Alta">Pressão Alta (Gegenpressing)</option>
                                    <option value="Tiki-Taka">Tiki-Taka Curto</option>
                                    <option value="Passe Longo">Linha Baixa &amp; Passe Longo</option>
                                </select>
                                <i className="fa-solid fa-chevron-down absolute right-3 top-3.5 text-slate-400 text-xs pointer-events-none"></i>
                            </div>
                            <p id="tacticalStyleDesc" className="text-[11px] text-slate-400 mt-2">Recuperação &amp; linhas avançadas com circulação paciente da bola.</p>
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
                    <div className="flex flex-row gap-5">
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
                                    (team && formations.filter(x => x.name == team?.training)[0]) &&
                                    formations.filter(x => x.name == team?.training)[0].positions.map((x, index) => {
                                        var players = team.players.filter(p => x.includes(p.position!))
                                        return (
                                            <>
                                                {
                                                    x.map((p, indexPosition) => {
                                                        var player = players.filter(x => x.position == p)[0];
                                                        if (player) {
                                                            var positionsLength = formations.filter(x => x.name == team?.training)[0].positions.length;
                                                            var divisionsWidth = pitchPlayersContainerRef.current!.offsetHeight / positionsLength;

                                                            return (
                                                                <div
                                                                    draggable={true}
                                                                    id={player.name.split(" ").join("_")}
                                                                    // data-name="player"
                                                                    className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group player-pin "
                                                                    style={{
                                                                        top: `${pitchPlayersContainerRef.current!.offsetHeight - (divisionsWidth * index)}px`,
                                                                        left: `${((pitchPlayersContainerRef.current!.offsetWidth / x.length) * indexPosition) + (pitchPlayersContainerRef.current!.offsetWidth / x.length) / 2}px`
                                                                    }}
                                                                >
                                                                    <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-lg text-emerald-400 font-extrabold text-xs sm:text-sm group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                                                                        <span>{player.overall}</span>
                                                                        <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-[9px] font-bold">
                                                                            {player.position}
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-1 px-2 py-0.5 bg-slate-950/90 text-white text-[10px] sm:text-xs font-semibold rounded border border-slate-700/80 whitespace-nowrap shadow-md">
                                                                        {player.name}
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        return (<></>)
                                                    })
                                                }
                                            </>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="min-w-[20rem] h-full flex flex-col gap-4 overflow-x-hidden overflow-y-auto max-h-[40rem]">
                            {
                                team && (
                                    team.players.map(p => (
                                        <div className="flex flex-row gap-2">
                                            <div className="h-10 w-10 rounded-full bg-emerald-500 flex flex-col items-center justify-center text-xs">
                                                <span>{p.overall}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-sm text-bold">{p.name}</label>
                                                <span className="text-xs text-emerald-400 font-semibold">{p.position}</span>
                                                <span className="text-xs">{p.overall}</span>
                                            </div>
                                        </div>
                                    ))
                                )
                            }
                        </div>
                    </div>
                </div>

            </div>
            <ScanTeam openModal={openaScanModal} isOpenModal={isOpenScanModal} setImportTeam={setImportTeam}></ScanTeam>

            <div id="createSchemeModal" className={cn("fixed  inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity p-4", showTrainingCreateModal ? "" : "hidden")}>
                <div className="bg-cardBg border border-cardBorder rounded-2xl p-5 max-w-xl w-full shadow-2xl space-y-4 transform transition-transform" id="schemeModalBox">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-lg">
                                <i className="fa-solid fa-sitemap"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Criar Novo Esquema Tático</h3>
                                <p className="text-xs text-slate-400">Salve as posições atuais do campo como um novo esquema.</p>
                            </div>
                        </div>
                        <button id="btnCloseSchemeModal" onClick={() => { isShowTrainingCreateModal(false) }} className="text-slate-400 hover:text-white p-1">
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                    {/* <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome do Esquema (ex: 4-1-4-1, 3-2-2-3)</label>
                        <input type="text" id="newSchemeName" placeholder="Ex: 4-1-4-1 Ofensivo" className="w-full bg-slate-900 text-white font-medium text-sm p-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none" />
                    </div> */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descrição Tática</label>
                        <textarea id="newSchemeDesc" rows={2} placeholder="Ex: Linha de 4 meias e 1 volante fixo cobrindo a zaga..." className="w-full bg-slate-900 text-white text-xs p-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none resize-none"></textarea>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center">
                            <input type="text" className="bg-slate-900 text-white border border-white rounded-lg w-10 text-center" />
                            <span className="w-20 h-[1px] bg-white"></span>
                            <input type="text" className="bg-slate-900 text-white border border-white rounded-lg w-10 text-center" />
                            <span className="w-20 h-[1px] bg-white"></span>
                            <input type="text" className="bg-slate-900 text-white border border-white rounded-lg w-10 text-center" />
                            <span className="w-20 h-[1px] bg-white"></span>
                            <input type="text" className="bg-slate-900 text-white border border-white rounded-lg w-10 text-center" />
                            <span className="w-20 h-[1px] bg-white"></span>
                            <input type="text" className="bg-slate-900 text-white border border-white rounded-lg w-10 text-center" />
                            <button className="bg-emerald-400 w-[2rem] h-[2rem] rounded-lg ml-1"><i className="fa fa-add"></i></button>
                            <button className="bg-red-400 w-[2rem] h-[2rem] rounded-lg ml-1"><i className="fa fa-minus"></i></button>
                        </div>
                        <div className="flex flex-row gap-12">
                            <div className="flex flex-col justify-center items-start">
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                            </div>
                            <div className="flex flex-col justify-center items-start">
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                            </div>
                            <div className="flex flex-col justify-center items-start">
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                            </div>
                            <div className="flex flex-col justify-center items-start">
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                            </div>
                            <div className="flex flex-col justify-center items-start">
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                                <span className="h-10 w-[1px] bg-white"></span>
                                <SelectPosition></SelectPosition>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
                        <i className="fa-solid fa-circle-info text-emerald-400 mt-0.5"></i>
                        <span>As 11 posições (X, Y) e funções táticas atualmente no relvado serão gravadas como padrão para este novo esquema.</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <button id="btnSaveNewScheme" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 text-white">
                            <i className="fa-solid fa-floppy-disk"></i> Salvar Esquema
                        </button>
                        <button onClick={() => { isShowTrainingCreateModal(false) }} id="btnCancelSchemeModal" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-medium transition">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}