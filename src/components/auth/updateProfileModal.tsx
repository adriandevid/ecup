'use client';

import { useApp } from "@/contexts/AppContext";
import { apiClient } from "@/lib/api";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function UpdateProfile() {
    const { isUpdateProfileModalOpen, currentUser, showToast, switchTab, addQueryLog, setUpdateProfileIsModalOpenState, setCurrentUser } = useApp();
    const [loading, setLoading] = useState(false);

    const [regName, setRegName] = useState(currentUser?.name);
    const [regUsername, setRegUsername] = useState(currentUser?.username);
    const [regPhotoUrl, setRegPhotoUrl] = useState(currentUser?.photo_url);
    const [regDesc, setRegDesc] = useState(currentUser?.description);

    useEffect(function () {
        if (currentUser) {
            setRegName(currentUser.name);
            setRegUsername(currentUser.username);
            setRegPhotoUrl(currentUser.photo_url);
            setRegDesc(currentUser.description);
        }
    }, [currentUser])
    
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiClient<{ token: string; user: User }>('/api/auth/update', {
                method: 'PUT',
                body: JSON.stringify({
                    name: regName, username: regUsername,
                    photo_url: regPhotoUrl, description: regDesc,
                    id: currentUser?.id
                }),
            });
            addQueryLog('UPDATE USER', `
                UPDATE table_name 
                    SET username = ${regUsername},
                        name = ${regName},
                        photo_url = ${regPhotoUrl},
                        description = ${regDesc}

                WHERE id = ${currentUser?.id} RETURNING *;
            `);

            setCurrentUser({
                name: `${regName}`, username: `${regUsername}`,
                photo_url: `${regPhotoUrl}`, description: `${regDesc}`,
                id: currentUser ? currentUser.id : 0
            });

            setUpdateProfileIsModalOpenState(false);
            showToast('Registro Atualizado', `Conta de ${data.user.name} atualizada!`, 'success');
                
            router.refresh();
        } catch (err) {
            showToast('Erro de Registro', (err as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    }

    const inputNoPadCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500';

    if (!isUpdateProfileModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        <i className="fa-solid fa-trophy text-emerald-400 mr-2" />Atualização de Perfil
                    </h3>
                    <button onClick={() => setUpdateProfileIsModalOpenState(false)} className="text-slate-400 hover:text-white transition">
                        <i className="fa-solid fa-xmark text-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="py-10 px-10 flex flex-col gap-5">
                    <img
                        className="h-40 w-40 rounded-xl object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/80 transition"
                        src={regPhotoUrl}
                        alt={regPhotoUrl}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }}
                    />
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">Nome Completo</label>
                        <input type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                            className={inputNoPadCls} placeholder="ex: João Gomez" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">Nome de Usuário (Login)</label>
                        <input type="text" required value={regUsername} onChange={e => setRegUsername(e.target.value)}
                            className={inputNoPadCls} placeholder="ex: jgomez" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">Link da Foto de Perfil (URL)</label>
                        <input type="url" value={regPhotoUrl} onChange={e => setRegPhotoUrl(e.target.value)}
                            className={inputNoPadCls} placeholder="https://exemplo.com/suafoto.png" />
                        <p className="text-xs text-slate-400 mt-1">
                            <i className="fa-solid fa-circle-info mr-1" />Deixe em branco para usar avatar gerado automaticamente.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1">Descrição / Frase de Efeito</label>
                        <textarea rows={2} value={regDesc} onChange={e => setRegDesc(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="ex: 'O rei da grande área'" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20">
                        <i className="fa-solid fa-pencil mr-2" />Atualizar Perfil
                    </button>
                </form>
            </div>
        </div>
    );
}