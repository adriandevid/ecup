/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useApp } from "@/contexts/AppContext";
import { apiClient, getStoredToken } from "@/lib/api";
import { useEffect, useState } from "react";

export default function ChatModal() {
    const { isModalMessage, messagesReceiveds, showToast, setMessagesReceiveds, setModalMessage, socket, currentUser } = useApp();
    const [message, setMessage] = useState<string | undefined>();
    const [messages, setMessages] = useState<any[]>([]);

    const [loading, isLoading] = useState<boolean>(false);
    const [loadingSendMessage, isLoadingSendMessage] = useState<boolean>(false);

    const getAll = async () => {
        isLoading(true);

        const response = await apiClient<any[]>('/api/message/all', {
            method: 'GET'
        });

        setMessages(response);
        isLoading(false);
    }

    const sendMessage = async (message: string) => {
        const storedToken = getStoredToken();
        if (socket && storedToken != null) {
            socket.emit("all-messages", JSON.stringify({ message, token: storedToken }),);
        }

        setMessage("");
    }

    useEffect(function () {
        getAll();
    }, [])

    useEffect(function () {
        setMessagesReceiveds([]);
    }, [isModalMessage])

    useEffect(function () {
        if (socket) {
            socket.on("load-messages", (msg) => {
                isLoadingSendMessage(msg == "true");
            })
        }
    }, [socket])

    useEffect(function () {
        if (messagesReceiveds.length > 0) {
            if (!isModalMessage) {
                showToast(`Mensagem`, `Mensagem de ${messagesReceiveds[0].user.name}`, 'info');
            }

            setMessages([
                ...messages,
                ...messagesReceiveds
            ]);
        }
    }, [messagesReceiveds])

    const scrollToBottom = () => {
        const messagesElement = document.getElementById("messages");

        if (messagesElement != null && messagesElement != undefined) {
            messagesElement.scroll(0, messagesElement.scrollHeight + 200);
        }
    }

    useEffect(function () {
        scrollToBottom();
    }, [isModalMessage, messages])

    useEffect(function () {
        scrollToBottom();
    }, [loading, loadingSendMessage])

    useEffect(function () {
        scrollToBottom();
    }, [loadingSendMessage])

    return (
        <>
            {
                isModalMessage && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
                            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">
                                    <i className="fa-solid fa-message text-emerald-400 mr-2" />Chat
                                </h3>
                                <button
                                    onClick={() => setModalMessage(false)}
                                    className="text-slate-400 hover:text-white transition"
                                >
                                    <i className="fa-solid fa-xmark text-lg" />
                                </button>
                            </div>

                            <form
                                // onSubmit={handleSubmit} 
                                className="py-10 px-4 flex flex-col gap-5 max-h-[85rem] overflow overflow-x-hidden"
                            >
                                <div
                                    id="messages"
                                    className="flex flex-col gap-6 max-h-[300px] overflow overflow-x-hidden bg-slate-900 py-10 px-4 rounded-lg"
                                >
                                    {
                                        messages.map((x, i) => {
                                            if (x.user_id == currentUser?.id) {
                                                return (
                                                    <div key={i} className="flex flex-row gap-4 items-center justify-end">
                                                        <p className="max-w-[190px]" style={{ lineBreak: 'anywhere' }}>{x.message}</p>
                                                        <img
                                                            className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/80 transition"
                                                            src={x.user.photo_url}
                                                            alt={x.user.photo_url}
                                                            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }}
                                                        />
                                                    </div>
                                                )
                                            }

                                            return (
                                                <div key={i} className="flex flex-row gap-4 items-center">
                                                    <img
                                                        className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/80 transition"
                                                        src={x.user.photo_url}
                                                        alt={x.user.photo_url}
                                                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }}
                                                    />
                                                    <p className="max-w-[100px]" style={{ lineBreak: 'anywhere' }}>{x.message}</p>
                                                </div>
                                            )
                                        })
                                    }
                                    {
                                        loading && (
                                            <div className="w-full flex flex-row justify-center">
                                                <div className="newtons-cradle">
                                                    <div className="newtons-cradle__dot"></div>
                                                    <div className="newtons-cradle__dot"></div>
                                                    <div className="newtons-cradle__dot"></div>
                                                    <div className="newtons-cradle__dot"></div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        loadingSendMessage && (
                                            <div className="flex flex-row gap-4 items-center justify-end">
                                                <div className="newtons-cradle">
                                                    <div className="newtons-cradle__dot"></div>
                                                    <div className="newtons-cradle__dot"></div>
                                                    <div className="newtons-cradle__dot"></div>
                                                    <div className="newtons-cradle__dot"></div>
                                                </div>

                                                <img
                                                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/80 transition"
                                                    src={currentUser?.photo_url}
                                                    alt={currentUser?.photo_url}
                                                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/1e293b/a5b4fc?text=FC'; }}
                                                />

                                            </div>
                                        )
                                    }
                                </div>
                                <textarea
                                    value={message}
                                    maxLength={200}
                                    onChange={(e) => setMessage(e.target.value)}
                                    // onChange={e => setRegDesc(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="ex: messagem" />
                                <button
                                    type="button"
                                    disabled={loadingSendMessage || loading}
                                    onClick={async () => {
                                        if (message) {
                                            await sendMessage(message);
                                        }
                                    }}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20">
                                    <i className="fa-solid fa-send mr-2" />{loadingSendMessage ? "Enviando Mensagem..." : "Enviar Mensagem"}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
            <div className="fixed bottom-20 right-10">
                <button
                    type="button"
                    // disabled={loading}
                    onClick={() => setModalMessage(true)}
                    className="w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold p-6 py-8 rounded-full transition shadow-lg shadow-emerald-500/20 flex flex-row justify-center items-center relative"
                >
                    {
                        messagesReceiveds.length > 0 ?
                            <span className="w-6 h-6 bg-red-500 absolute top-[-3px] left-[-3px] rounded-full text-[10px] flex flex-row items-center justify-center">+{messagesReceiveds.length}</span> :
                            <></>
                    }
                    <i className="fa-solid fa-lg fa-message" />
                </button>
            </div>
        </>
    )
}