/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, TabId, ToastState, QueryLog } from '@/types';
import { getStoredToken } from '@/lib/api';
import io, { Socket } from 'socket.io-client';

interface AppContextType {
  currentUser: User | null;
  activeTab: TabId;
  toast: ToastState | null;
  queryLogs: QueryLog[];
  token: string | null;
  isModalOpen: boolean;
  isUpdateProfileModalOpen: boolean;
  isModalMessage: boolean;
  socket: Socket | undefined;
  messagesReceiveds: any[];

  setSocket: (socket: Socket | undefined) => void;
  setMessagesReceiveds: (messages: any[]) => void;
  setModalMessage: (open: boolean) => void;

  login: (token: string, user: User) => void;
  logout: () => void;
  switchTab: (tab: TabId) => void;
  showToast: (title: string, message: string, type: ToastState['type']) => void;
  addQueryLog: (action: string, query: string) => void;
  setModalOpen: (open: boolean) => void;
  setUpdateProfileIsModalOpenState: (open: boolean) => void;
  setCurrentUser: (currentUser: User | null) => void;
  clearLogs: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('auth');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpenState] = useState(false);
  const [isUpdateProfileModalOpen, setUpdateProfileIsModalOpenState] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isModalMessage, setModalMessage] = useState(false);
  const [messagesReceiveds, setMessagesReceiveds] = useState<any[]>([]);


  useEffect(() => {
    const storedToken = getStoredToken();

    if (storedToken == null) return;

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setToken(storedToken);
          setActiveTab('dashboard');
        } else {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('futchamp_token');
          }
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('futchamp_token');
        }
      });
  }, []);

  const login = useCallback((newToken: string, user: User) => {
    // localStorage.setItem('futchamp_token', newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('futchamp_token', newToken);
    }

    setToken(newToken);
    setCurrentUser(user);
    setActiveTab('dashboard');
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('futchamp_token');
    }

    setToken(null);
    setCurrentUser(null);
    setActiveTab('auth');
    const timestamp = new Date().toLocaleTimeString();
    setQueryLogs(prev => [{ timestamp, action: 'LOGOUT', query: 'Sessão encerrada pelo usuário.' }, ...prev]);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ title: 'Sessão Encerrada', message: 'Até a próxima partida!', type: 'info' });
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const showToast = useCallback((title: string, message: string, type: ToastState['type']) => {
    setToast({ title, message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const addQueryLog = useCallback((action: string, q: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setQueryLogs(prev => [{ timestamp, action, query: q }, ...prev]);
  }, []);

  const setModalOpen = useCallback((open: boolean) => {
    setIsModalOpenState(open);
  }, []);

  const clearLogs = useCallback(() => {
    setQueryLogs([]);
  }, []);

  const [socket, setSocket] = useState<Socket | undefined>();

  useEffect(function () {
    if (socket) {
      socket.on("all-messages", (msg) => {
        setMessagesReceiveds([
          ...messagesReceiveds,
          JSON.parse(msg)
        ]);
      })
    }
  }, [socket])
  useEffect(function () {
    const storedToken = getStoredToken();

    const newSocket = io(`ws://${process.env.NEXT_PUBLIC_WS_URL}/?token=${storedToken}`, {
      transports: ["websocket", "polling"]
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    }
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, activeTab, toast, queryLogs, token, isModalOpen, isUpdateProfileModalOpen, isModalMessage, socket, messagesReceiveds,
      login, logout, switchTab, showToast, addQueryLog, setModalOpen, setModalMessage, clearLogs, setUpdateProfileIsModalOpenState, setCurrentUser, setSocket, setMessagesReceiveds
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
