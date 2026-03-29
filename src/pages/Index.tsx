import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEntries } from '@/hooks/useEntries';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, BarChart3, Clock, User, 
  Loader2, LogOut, LayoutDashboard 
} from 'lucide-react';
import { DailyEntryForm } from '@/components/DailyEntryForm';
import { ScoreChart } from '@/components/ScoreChart';
import { HistoryPage } from '@/components/HistoryPage';
import { ExportButtons } from '@/components/ExportButtons';
import { ProfilePage } from '@/components/ProfilePage';
import { RiskDisplay } from '@/components/RiskDisplay';
import { AlertPanel } from '@/components/AlertPanel';
import { PointsStatement } from '@/components/PointsStatement';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'checkin' | 'chart' | 'history' | 'profile';

export default function Index() {
  const { signOut, session, isLoading: authLoading } = useAuth();
  const { entries, isLoading: entriesLoading } = useEntries();
  const [tab, setTab] = useState<Tab>('dashboard');
  const navigate = useNavigate();

  // PROTEÇÃO DE ROTA: Se não houver sessão após o carregamento, vai para o Login
  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/auth');
    }
  }, [session, authLoading, navigate]);

  const allEntries = useMemo(() => {
    if (!entries) return [];
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const latestEntry = allEntries[0] || null;

  if (authLoading || entriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
        <Loader2 className="animate-spin text-[#20b2aa]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col pb-24 font-sans">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-gray-50">
              <img src="/pwa-192x192.png" alt="Logo" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-xl leading-none">MindCare IA</h1>
              <p className="text-[10px] text-[#20b2aa] font-black uppercase tracking-[0.15em] mt-1.5">Gestão de Burnout</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 transition-all">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        {tab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PointsStatement entries={allEntries} />
            <RiskDisplay entries={allEntries} latestEntry={latestEntry} />
            {latestEntry && latestEntry.risk_level !== 'low' && <AlertPanel riskLevel={latestEntry.risk_level} />}
          </div>
        )}
        {tab === 'checkin' && <DailyEntryForm />}
        {tab === 'chart' && <ScoreChart entries={allEntries} />}
        {tab === 'history' && (
          <div className="space-y-6">
            <HistoryPage entries={allEntries} />
            <ExportButtons entries={allEntries} />
          </div>
        )}
        {tab === 'profile' && <ProfilePage />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4">
        <div className="max-w-md mx-auto flex justify-around">
          {[{ key: 'dashboard', icon: LayoutDashboard, label: 'Início' },
            { key: 'checkin', icon: ClipboardCheck, label: 'Check-in' },
            { key: 'chart', icon: BarChart3, label: 'Gráfico' },
            { key: 'history', icon: Clock, label: 'Histórico' },
            { key: 'profile', icon: User, label: 'Perfil' }].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as Tab)} className={`flex-1 flex flex-col items-center py-5 transition-all ${tab === t.key ? 'text-[#20b2aa]' : 'text-gray-300'}`}>
              <t.icon size={24} />
              <span className="text-[9px] mt-2 font-black uppercase">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}