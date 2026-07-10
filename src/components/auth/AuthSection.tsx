'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/lib/api';
import { User } from '@/types';
import { cn } from '@/lib/tailwindcss';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'register';

export function AuthSection() {
  const { login, showToast, addQueryLog } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhotoUrl, setRegPhotoUrl] = useState('');
  const [regDesc, setRegDesc] = useState('');
  const [regEmail, setRegEmail] = useState('');

  const [recoverPassword, isRecoverPassword] = useState<boolean>(false);

  const searchParams = useSearchParams();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      addQueryLog('LOGIN', `SELECT * FROM users WHERE username = '${loginUsername}' AND password = '***';`);
      showToast('Sucesso', `Bem-vindo, ${data.user.name}!`, 'success');
      login(data.token, data.user);
    } catch (err) {
      showToast('Login Inválido', (err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function sendRecoverEmail() {
    try {

      setLoading(true);
      setRegEmail("");

      await apiClient('/api/auth/recover-password', {
        method: 'POST',
        body: JSON.stringify({ email: regEmail }),
      });
      setLoading(false);
      showToast('Email enviado', `Email de recuperação de senha enviado com sucesso (Atenção na caixa de spam)!`, 'success');
      isRecoverPassword(false);
    } catch(err) {
      setLoading(false);
      isRecoverPassword(true);
      showToast('Envio de códio', "Já foi enviado um código para seu email!", 'error');
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: regName, username: regUsername, password: regPassword,
          photo_url: regPhotoUrl, description: regDesc,
        }),
      });
      addQueryLog('INSERT USER', `INSERT INTO users (username, name) VALUES ('${regUsername}', '${regName}');`);
      showToast('Registro Realizado', `Conta de ${data.user.name} criada!`, 'success');
      login(data.token, data.user);
    } catch (err) {
      showToast('Erro de Registro', (err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // async function handleLoadDemo() {
  //   setLoading(true);
  //   try {
  //     const data = await apiClient<{ token: string; user: User }>('/api/players/demo', {
  //       method: 'POST',
  //     });
  //     addQueryLog('LOAD DEMO DATA', 'Cadastrados 8 atletas profissionais no PostgreSQL para testes.');
  //     showToast('Demonstração Pronta', '8 craques cadastrados! Logado como Lionel Messi.', 'success');
  //     login(data.token, data.user);
  //   } catch (err) {
  //     showToast('Erro Demo', (err as Error).message, 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const activeBtnCls = 'w-1/2 pb-3 font-bold text-center border-b-2 border-emerald-500 text-emerald-400 text-lg';
  const inactiveBtnCls = 'w-1/2 pb-3 font-bold text-center border-b-2 border-transparent text-slate-400 hover:text-slate-200 text-lg transition';
  const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const inputNoPadCls = 'w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500';

  useEffect(function () {
    console.log(searchParams.get('recorver-hashcode'));
  }, [])
  return (
    <section className="max-w-md mx-auto my-12 bg-slate-800 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-8">
        <div className={cn("flex border-b border-slate-700 mb-6", recoverPassword ? "hidden" : "")}>
          <button onClick={() => setMode('login')} className={mode === 'login' ? activeBtnCls : inactiveBtnCls}>
            Entrar
          </button>
          <button onClick={() => setMode('register')} className={mode === 'register' ? activeBtnCls : inactiveBtnCls}>
            Registrar-se
          </button>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {
              recoverPassword ?
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">E-mail</label>
                    <input type="email" required defaultValue={regEmail} onChange={e => setRegEmail(e.target.value)}
                      className={inputNoPadCls} placeholder="ex: example@gmail.com"
                      pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                      title="Please enter a valid email address (e.g., name@example.com)"
                    />
                  </div>
                  <button type="button" disabled={loading}
                    onClick={async () => {
                      if (regEmail.length == 0) {
                        showToast('Recuperação de Senha', "informe o email do usuário!", 'error');
                        return;
                      }

                      await sendRecoverEmail();
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20">
                    <i className="fa-solid fa-user-plus mr-2" />Recuperar Senha
                  </button>
                </> :
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">Usuário</label>
                    <div className="relative">
                      <i className="fa-solid fa-user absolute left-3 top-3.5 text-slate-500" />
                      <input type="text" required value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                        className={inputCls} placeholder="ex: jgomez" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">Senha</label>
                    <div className="relative">
                      <i className="fa-solid fa-lock absolute left-3 top-3.5 text-slate-500" />
                      <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                        className={inputCls} placeholder="••••••••" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20">
                    <i className="fa-solid fa-right-to-bracket mr-2" />Acessar Sistema
                  </button>
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-700" />
                    <span className="flex-shrink mx-4 text-slate-500 text-xs">Ou recuperar a senha</span>
                    <div className="flex-grow border-t border-slate-700" />
                  </div>
                  <button type="button" disabled={loading} onClick={() => {
                    isRecoverPassword(true);
                  }}
                    className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 font-semibold py-2 px-4 rounded-xl transition text-sm">
                    <i className="fa-solid fa-user mr-2" />Recuperar Senha
                  </button>
                </>
            }
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
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
              <label className="block text-sm font-semibold text-slate-300 mb-1">Senha</label>
              <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)}
                className={inputNoPadCls} placeholder="••••••••" />
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
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-user-plus mr-2" />Cadastrar &amp; Login
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
