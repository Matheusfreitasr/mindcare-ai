import { useState } from 'react';
import { CheckInForm } from '@/components/CheckInForm';
import { RiskDisplay } from '@/components/RiskDisplay';
import { ScoreChart } from '@/components/ScoreChart';
import { AlertPanel } from '@/components/AlertPanel';
import { useEntries } from '@/hooks/useEntries';
import { Activity, ClipboardCheck, BarChart3 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

type Tab = 'dashboard' | 'checkin' | 'history';

const Index = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { entries, latestEntry, addEntry, isLoading } = useEntries();

  const handleSubmit = (data: { fatigue: number; stress: number; sleepQuality: number }) => {
    const entry = addEntry(data);
    toast.success(`Check-in registrado! Score: ${entry.score}`);
    setTab('dashboard');
  };

  const tabs: { key: Tab; icon: typeof Activity; label: string }[] = [
    { key: 'dashboard', icon: Activity, label: 'Dashboard' },
    { key: 'checkin', icon: ClipboardCheck, label: 'Check-in' },
    { key: 'history', icon: BarChart3, label: 'Evolução' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="container flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="text-primary-foreground" size={18} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-tight">MindCare IA</h1>
            <p className="text-xs text-muted-foreground">Predição de Burnout</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container py-4 space-y-4 pb-20">
        {tab === 'dashboard' && (
          <>
            <RiskDisplay entries={entries} latestEntry={latestEntry} />
            {latestEntry && latestEntry.risk_level !== 'low' && (
              <AlertPanel riskLevel={latestEntry.risk_level} />
            )}
          </>
        )}

        {tab === 'checkin' && (
          <CheckInForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {tab === 'history' && (
          <ScoreChart entries={entries} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-card/90 backdrop-blur-md border-t border-border">
        <div className="container flex">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center py-2.5 text-xs transition-colors ${
                tab === key
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} />
              <span className="mt-0.5">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
