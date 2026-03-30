import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader2, ClipboardCheck, TrendingUp, User as UserIcon, LogOut, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { DailyEntryForm } from '@/components/DailyEntryForm';
import { ProfilePage } from '@/components/ProfilePage';
import { EvolutionTab } from '@/components/EvolutionTab';

type TabId = 'dashboard' | 'checkin' | 'evolution' | 'profile';

export default function Index() {
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/auth');
      setUserEmail(user.email || '');

      const { data: profileData }: any = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const userMeta = user.user_metadata || {};
      setProfile({
        ...profileData,
        display_name: profileData?.display_name || userMeta.display_name || 'Profissional',
        work_places: (profileData?.work_places?.length > 0) ? profileData.work_places : (userMeta.work_places || []),
        emergency_contact: profileData?.emergency_contact || ''
      });

      const { data: entriesData } = await supabase.from('daily_entries').select('*').eq('user_id', user.id).order('date', { ascending: false });
      setEntries(entriesData || []);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/auth');
  }

  // NOVA LÓGICA DE BLOQUEIO (Matemática Absoluta de Data)
  const today = new Date();
  const hasCheckedInToday = entries.some(e => {
    const d = new Date(e.date);
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]"><Loader2 className="animate-spin text-[#20b2aa]" size={40} /></div>;

  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Activity },
    { id: 'checkin', label: 'Check-in', icon: ClipboardCheck },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'profile', label: 'Perfil', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-32 font-sans relative overflow-x-hidden print:bg-white print:pb-0">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#20b2aa]/10 rounded-xl"><Activity className="text-[#20b2aa]" size={20} /></div>
            <div>
                <h1 className="font-black text-gray-900 tracking-tight leading-none text-lg">MindCare IA</h1>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gestão de Burnout</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 relative z-10 print:p-0 print:m-0">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-[#20b2aa] to-[#1a9089] p-10 md:p-14 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Sparkles size={16} className="text-orange-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Prevenção e Cuidado</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">Cuidar de quem cuida.</h2>
                <p className="text-sm md:text-base font-medium opacity-90 leading-relaxed max-w-lg">
                  O Burnout na enfermagem é silencioso. Monitorar o seu bem-estar diariamente é o primeiro passo para preservar a sua saúde mental.
                </p>
                <button 
                  onClick={() => setActiveTab(hasCheckedInToday ? 'evolution' : 'checkin')} 
                  className="bg-white text-[#20b2aa] px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 mt-4 hover:shadow-2xl"
                >
                  {hasCheckedInToday ? <TrendingUp size={20} /> : <ClipboardCheck size={20} />} 
                  {hasCheckedInToday ? 'Ver Evolução de Hoje' : 'Fazer Check-in Diário'}
                </button>
              </div>
              <Heart className="absolute -bottom-10 -right-10 text-white/10" size={280} fill="currentColor" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 space-y-5">
                <div className="p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-500"><ShieldCheck size={24}/></div>
                <h4 className="font-black text-gray-900 uppercase text-[11px] tracking-widest">O que fazer para melhorar?</h4>
                <ul className="text-xs text-gray-500 space-y-4 font-medium leading-relaxed">
                  <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div><p><strong className="text-gray-700">Pausas Estratégicas:</strong> Faça pequenos intervalos durante o plantão.</p></li>
                  <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div><p><strong className="text-gray-700">Higiene do Sono:</strong> Garanta horas de descanso num ambiente escuro.</p></li>
                  <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div><p><strong className="text-gray-700">Desconexão:</strong> Ao sair da unidade, evite prolongar conversas de trabalho.</p></li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 space-y-5">
                <div className="p-3 bg-red-50 rounded-2xl w-fit text-red-500"><Heart size={24} fill="currentColor"/></div>
                <h4 className="font-black text-gray-900 uppercase text-[11px] tracking-widest">Precisa de Ajuda?</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Se estiver sentindo exaustão extrema ou estresse constante, procure um profissional. O MindCare não substitui terapia.</p>
                <div className="pt-2"><a href="tel:188" className="inline-block bg-red-50 text-red-500 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors">Ligar para o CVV (188)</a></div>
              </div>
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO ENTRE ABAS COM O BLOQUEIO RÍGIDO PROPAGADO */}
        {activeTab === 'checkin' && <DailyEntryForm userName={profile?.display_name} hasCheckedInTodayProp={hasCheckedInToday} onComplete={() => {fetchData(); setActiveTab('evolution');}} />}
        {activeTab === 'evolution' && <EvolutionTab profile={profile} userEmail={userEmail} />}
        {activeTab === 'profile' && <ProfilePage profile={profile} setProfile={setProfile} />}
      </main>

      <nav className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[2.5rem] z-50 p-2 print:hidden">
        <div className="flex justify-between items-center">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as TabId)} className={`flex flex-col items-center gap-1.5 p-3 px-5 rounded-3xl transition-all ${activeTab === id ? 'bg-[#20b2aa] text-white shadow-md' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
              <Icon size={20} /><span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}