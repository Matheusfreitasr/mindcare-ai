import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEntries } from '@/hooks/useEntries';
import { useNavigate } from 'react-router-dom';
import { CheckInForm } from '@/components/CheckInForm';
import { RiskDisplay } from '@/components/RiskDisplay';
import { ScoreChart } from '@/components/ScoreChart';
import { AlertPanel } from '@/components/AlertPanel';
import { HistoryPage } from '@/components/HistoryPage';
import { ProfilePage } from '@/components/ProfilePage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  TrendingUp, 
  History, 
  User, 
  LogOut, 
  Loader2,
  Activity
} from 'lucide-react';

type TabId = 'dashboard' | 'checkin' | 'evolution' | 'history' | 'profile';

export default function Index() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
          else {
            // Fallback: use auth metadata
            const meta = user.user_metadata;
            setProfile({
              display_name: meta?.display_name || '',
              hospitals: meta?.hospitals || [],
              shift: meta?.shift || '',
            });
          }
        });
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return <AppShell activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} signOut={signOut} />;
}

function AppShell({ activeTab, setActiveTab, profile, signOut }: { 
  activeTab: TabId; 
  setActiveTab: (t: TabId) => void; 
  profile: any; 
  signOut: () => Promise<void>;
}) {
  const { entries, latestEntry, addEntry, isLoading } = useEntries();

  const handleCheckin = async (data: { fatigue: number; stress: number; sleepQuality: number }) => {
    const result = await addEntry(data);
    if (result) {
      toast.success('Check-in salvo com sucesso!');
      setActiveTab('dashboard');
    } else {
      toast.error('Erro ao salvar check-in.');
    }
  };

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin', label: 'Check-in', icon: ClipboardCheck },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-primary" size={22} />
            <h1 className="font-heading font-extrabold text-lg tracking-tight">MindCare IA</h1>
          </div>
          <button onClick={signOut} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <RiskDisplay entries={entries} latestEntry={latestEntry} />
            <AlertPanel profile={profile} entries={entries} />
          </div>
        )}
        {activeTab === 'checkin' && (
          <CheckInForm onSubmit={handleCheckin} isLoading={isLoading} />
        )}
        {activeTab === 'evolution' && (
          <ScoreChart entries={entries} />
        )}
        {activeTab === 'history' && (
          <HistoryPage entries={entries} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/50 z-50">
        <div className="max-w-2xl mx-auto flex justify-around py-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === id 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
