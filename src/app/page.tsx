'use client';

import { AppProvider, useApp } from '@/contexts/AppContext';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Toast } from '@/components/ui/Toast';
import { AuthSection } from '@/components/auth/AuthSection';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { ChampionshipsTab } from '@/components/championships/ChampionshipsTab';
import { PlayersTab } from '@/components/players/PlayersTab';
import { ConsoleTab } from '@/components/console/ConsoleTab';
import { CreateChampionshipModal } from '@/components/championships/CreateChampionshipModal';

function AppContent() {
  const { currentUser, activeTab } = useApp();

  return (
    <>
      <Header />
      <MobileNav />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 md:mb-8">
        {!currentUser ? (
          <AuthSection />
        ) : (
          <>
            <div className={activeTab === 'dashboard'     ? '' : 'hidden'}><DashboardTab /></div>
            <div className={activeTab === 'championships' ? '' : 'hidden'}><ChampionshipsTab /></div>
            <div className={activeTab === 'profiles'      ? '' : 'hidden'}><PlayersTab /></div>
            <div className={activeTab === 'console'       ? '' : 'hidden'}><ConsoleTab /></div>
          </>
        )}
      </main>

      <CreateChampionshipModal />

      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 space-y-2 mt-auto">
        <p>
          Desenvolvido com <i className="fa-solid fa-heart text-rose-500 animate-pulse" /> e PostgreSQL.
        </p>
        <p className="font-mono">PostgreSQL Database Engine &copy; 2026 | FutChamp Inc.</p>
      </footer>

      <Toast />
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <div className="text-slate-100 min-h-screen flex flex-col">
        <AppContent />
      </div>
    </AppProvider>
  );
}
