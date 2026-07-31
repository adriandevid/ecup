'use client';

import { Card, ObjectTextOCR } from "@/types";
import { PaddleOCR } from "@paddleocr/paddleocr-js";
import { useEffect, useState } from "react";

function isValidNumber(str: string) {
    return typeof str === 'string' && str.trim() !== '' && Number.isFinite(Number(str));
}

export default function ScanTeam({ openModal, isOpenModal, setImportTeam }: {
    openModal: boolean, isOpenModal: ((open: boolean) => void), setImportTeam: (team: {
        players: Card[];
        training: string
        tactical_setup: string
    }) => void
}) {

    const [ocr, setOcr] = useState<PaddleOCR | any | null>(null);
    const [loadingConnectionWebgpu, isLoadingConnectionWebgpu] = useState<boolean>(false);
    const [file, setFile] = useState<any>();
    const [fileBase64, setFileBase64] = useState<string | undefined>();
    const [teamDatas, setTeamData] = useState<
        {
            players: Card[];
            training: string
            tactical_setup: string
        }>();

    const positionsPtBr = [
        "GOL", // Goleiro
        "GO",
        "ZC",  // Zagueiro Central
        "LE",  // Lateral Esquerdo
        "LD",  // Lateral Direito
        "VOL", // Volante
        "MC",  // Meio-Campista
        "MAT", // Meio-Atacante
        "MLE", // Meio Lateral Esquerdo
        "MLD", // Meio Lateral Direito
        "MLG",
        "PE",  // Ponta Esquerda
        "PD",  // Ponta Direita
        "SA",  // Segundo Atacante
        "CA",   // Centroavante,
        "PTE",
        "PTD"
    ];

    var taticalSetupNamespaces = [
        {
            title: "Posse de bola",
            splited: ["posse", "bola"]
        }
    ];

    const loadCardsOfTeam = (datas: ObjectTextOCR[]): Card[] => {
        var cards: Card[] = [];
        var names = datas.filter(x => x.text.length > 4 && /^[\p{L}\s]+$/u.test(x.text.replaceAll(" ", "")));

        names.forEach(x => {
            if (x.text.split(" ").filter(t => taticalSetupNamespaces.filter(s => s.splited.includes(t)).length > 0).length == 0) {
                var card = searchCard(datas, x.text);
                if (card.overall) {
                    cards.push(searchCard(datas, x.text));
                }
            }
        })

        return cards;
    }


    const searhTraining = (datas: ObjectTextOCR[]) => {
        try {
            return datas.filter(x => x.text.split("-").length >= 3)[0].text
        } catch(ex) {
            return ""
        }
    }

    const searchTaticalSetup = (datas: ObjectTextOCR[]): string => {
        var name: string = "";

        try {
            datas.forEach(x => {
                var nameSplited = x.text.split(" ");

                nameSplited.forEach(t => {
                    var search = taticalSetupNamespaces.filter(s => s.splited.includes(t));
                    if (search.length > 0) {
                        name = search[0].title
                    }
                })
            })

            return name;
        } catch (ex) {

            return name;
        }

    }

    const searchCard = (datas: ObjectTextOCR[], playerName: string) => {
        var baseCard = datas.filter(x => x.text == playerName).sort((a, b) => a.score + b.score)[0];
        var card: { name: string, position?: string | undefined, overall?: number | undefined } = {
            name: baseCard.text
        }

        try {
            var heigthRowCards = datas.filter(x => (baseCard.poly[0][1] - x.poly[0][1]) > 0);

            var heigthRowCardsAroundBaseCard = heigthRowCards.map(x => ({
                c: x,
                axisX: baseCard.poly[0][0] - x.poly[0][0],
                axisY: baseCard.poly[0][1] - x.poly[0][1],
                around: (baseCard.poly[0][0] - x.poly[0][0]) + (baseCard.poly[0][1] - x.poly[0][1])
            })).filter(x => x.axisX > 0).sort((a, b) => a.around - b.around)

            var positionCoordinates = heigthRowCardsAroundBaseCard
                .filter(x => {
                    if (positionsPtBr.includes(x.c.text.toUpperCase())) {
                        return true;
                    } else if (x.c.text.length >= 2 && positionsPtBr.filter(t => x.c.text.includes(t)).length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                })[0];

            var overallCoordinates = heigthRowCardsAroundBaseCard
                .filter(x => isValidNumber(x.c.text))[0];

            card.position = positionCoordinates.c.text;
            card.overall = parseInt(overallCoordinates.c.text);
        } catch (ex) {
            console.log("dados", datas)
            console.log("erro", baseCard)
        }

        return card;
    }

    const fileToBase64 = (file: any): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(`${reader.result}`);
        reader.onerror = (error) => reject(error);
    });

    const handleImage = async (e: any) => {
        setFile(e.target.files[0]);
        setFileBase64(await fileToBase64(e.target.files[0]));
    };

    const scanTeam = async () => {
        if (ocr != null && file) {
            try {
                isLoading(true);

                const [result] = await ocr.predict(file);

                console.log(result.items)
                var team = {
                    players: loadCardsOfTeam(result.items),
                    training: searhTraining(result.items),
                    tactical_setup: searchTaticalSetup(result.items)
                };
                console.log(team)

                isLoading(false);

                setTeamData(team);

                setImportTeam(team);
            } catch (ex) {
                console.log(ex)
                isLoading(false);
            }
        }
    }

    const [loading, isLoading] = useState<boolean>(false);

    const pipelineConfig = `
    pipeline_name: OCR
    SubModules:
      TextDetection:
        model_name: PP-OCRv5_mobile_det
        batch_size: 2
      TextRecognition:
        model_name: PP-OCRv5_mobile_rec
        batch_size: 6
  `;

    useEffect(() => {
        if (openModal) {
            setTeamData(undefined);
            setFile(undefined);
            setFileBase64(undefined);
        }

        if (ocr == null && openModal) {
            console.error = (...args) => {
                if (
                    typeof args[0] === "string" &&
                    args[0].includes("CleanUnusedInitializersAndNodeArgs")
                ) {
                    return;
                }

                return window.console.warn(...args);
            };

            isLoadingConnectionWebgpu(true);

            PaddleOCR.create({
                pipelineConfig,
                lang: "ch",
                ocrVersion: "PP-OCRv5",
                ortOptions: { backend: "auto" },
                textDetectionModelAsset: {
                    url: "/models/PP-OCRv5_mobile_det_onnx.tar"
                },
                textRecognitionModelAsset: {
                    url: "/models/PP-OCRv5_mobile_rec_onnx.tar"
                },
                textDetectionModelName: "PP-OCRv5_mobile_det",
                textRecognitionModelName: "PP-OCRv5_mobile_rec"
            }).then((e) => {
                e.initialize().then(x => {
                    setOcr(e);
                    isLoadingConnectionWebgpu(false);
                })
            });
        }
    }, [openModal]);

    if (loadingConnectionWebgpu) {
        return (
            <div className='fixed top-0 left-0 w-full h-full bg-black/[.3]'>
                <div className='flex flex-row justify-center items-center w-full h-full'>
                    <div className="text-center py-12 text-white">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-2" />
                        <p className="text-sm">Connectando ao ocr...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!openModal) {
        return <></>
    }

    return (
        <div id="scan-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 transform transition-all">
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#080d18]/60">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                            <i className="fa-solid fa-camera"></i>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Importador OCR / IA de Escalação</h3>
                            <p className="text-xs text-slate-400">Envie uma foto da tela do jogo ou da súmula impressa</p>
                        </div>
                    </div>
                    <button disabled={loading} onClick={() => {
                        isOpenModal(false);
                    }} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>


                <div className="p-6 space-y-6">


                    <div id="upload-zone" className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-[#080d18]/60 rounded-xl p-8 text-center cursor-pointer transition group relative overflow-hidden">


                        {
                            fileBase64 && (
                                <div id="scan-preview-wrapper" className="relative w-full h-64 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                                    {
                                        loading && (
                                            <div id="scan-laser-bar" className="scan-laser"></div>
                                        )
                                    }
                                    <img id="scan-preview-img" src={fileBase64} alt="Escalação para escaneamento" className="w-full h-full object-contain" />

                                    {
                                        loading && (
                                            <div id="scan-overlay-boxes" className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-1/4 left-1/4 w-32 h-12 border-2 border-emerald-400 bg-emerald-500/20 rounded animate-pulse"></div>
                                                <div className="absolute top-1/2 left-1/3 w-28 h-10 border-2 border-emerald-400 bg-emerald-500/20 rounded animate-pulse"></div>
                                                <div className="absolute bottom-1/4 right-1/4 w-36 h-12 border-2 border-emerald-400 bg-emerald-500/20 rounded animate-pulse"></div>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }


                        {
                            (fileBase64 == undefined) && (
                                <>
                                    <div id="upload-placeholder" className="space-y-3 py-4" onClick={() => {
                                        document.getElementById('file-input-scanner')?.click()
                                    }}>
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 group-hover:bg-emerald-950/80 group-hover:text-emerald-400 text-slate-400 flex items-center justify-center text-2xl transition">
                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">Clique para carregar ou arraste uma foto aqui</p>
                                            <p className="text-xs text-slate-400 mt-1">Suporta capturas do FIFA/EAFC, eFootball, FM ou fotos de formulários</p>
                                        </div>
                                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
                                            Presets rápidos de teste disponíveis abaixo
                                        </span>
                                    </div>

                                    <input type="file" id="file-input-scanner" className="hidden" accept="image/*" onChange={handleImage} />
                                </>
                            )
                        }
                    </div>

                    <div id="scan-status-container" className="space-y-2 hidden">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-semibold flex items-center gap-2" id="scan-status-text"><i className="fa-solid fa-check text-emerald-400"></i> Mapeando posições e atributos dos atletas...</span>
                            <span className="text-emerald-400 font-mono font-bold" id="scan-status-percent">100%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div id="scan-progress-bar" className="h-full bg-emerald-500 w-0 transition-all duration-300" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    {
                        teamDatas && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                        <i className="fa-solid fa-list-check text-emerald-400"></i> Atletas Identificados (<span id="val-player-count">{teamDatas.players.length}</span>)
                                    </label>
                                    {/* <button onclick="addValidationRow()" className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition">
                                <i className="fa-solid fa-plus text-xs"></i> Adicionar Atleta
                            </button> */}
                                </div>
                                <div className="overflow-x-auto bg-[#080d18] border border-slate-800 rounded-xl max-h-60 overflow-y-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                                            <tr>
                                                <th className="py-2.5 px-3">Nome do Jogador</th>
                                                <th className="py-2.5 px-3 w-28">Posição</th>
                                                <th className="py-2.5 px-3 w-20 text-center">OVR</th>
                                            </tr>
                                        </thead>
                                        <tbody id="validation-players-list" className="divide-y divide-slate-800/80">
                                            {
                                                teamDatas.players.map(x => (
                                                    <tr className="hover:bg-slate-800/40 transition">
                                                        <td className="py-2 px-2">
                                                            <input defaultValue={x.name} type="text" value={x.name} className="w-full bg-[#0f172a] border border-slate-700/80 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold" />
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <select value={x.position?.toUpperCase()} className="w-full bg-[#0f172a] border border-slate-700/80 rounded px-2 py-1 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none">
                                                                {
                                                                    positionsPtBr.map((x, i) => (
                                                                        <option value={x} key={i}>{x}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <input value={x.overall} type="number" min="50" max="99" className="w-full bg-[#0f172a] border border-slate-700/80 rounded px-2 py-1 text-xs text-center text-amber-400 font-extrabold focus:border-emerald-500 focus:outline-none" />
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        )
                    }
                </div>

                <div className="p-4 bg-[#080d18] border-t border-slate-800 flex items-center justify-between">
                    <button onClick={() => isOpenModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition">
                        Cancelar
                    </button>
                    <button id="btn-start-scan" onClick={scanTeam} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 text-slate-950 flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 text-white" disabled={loading}>
                        {
                            loading ?
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin" />
                                    Processando Importação ...
                                </> :
                                <>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    Processar e Importar
                                </>
                        }
                    </button>
                    {
                        teamDatas && (
                            <button id="btn-start-scan" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 text-slate-950 flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 text-white" disabled={loading}>
                                {
                                    loading ?
                                        <>
                                            <i className="fa-solid fa-circle-notch fa-spin" />
                                            Processando ...
                                        </> :
                                        <>
                                            <i className="fa-solid fa-check"></i>
                                            Confirmar Time
                                        </>
                                }
                            </button>
                        )
                    }
                </div>

            </div>
        </div>
    )
}