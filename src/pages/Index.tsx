import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader2, ClipboardCheck, TrendingUp, User as UserIcon, LogOut, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { DailyEntryForm } from '@/components/DailyEntryForm';
import { ProfilePage } from '@/components/ProfilePage';
import { EvolutionTab } from '@/components/EvolutionTab';

type TabId = 'dashboard' | 'checkin' | 'evolution' | 'profile';

const getLocalYMD = (d?: string | Date) => {
  const dateObj = d ? new Date(d) : new Date();
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

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
      setEntries((entriesData as any[]) || []);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/auth');
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]"><Loader2 className="animate-spin text-[#20b2aa]" size={40} /></div>;

  const todayYMD = getLocalYMD();
  const todaysEntries = entries.filter((e: any) => getLocalYMD(e.date) === todayYMD);
  
  const hasFinishedToday = todaysEntries.some((e: any) => e.hospital_name === 'FINALIZADO');
  const checkedInHospitals = todaysEntries.map((e: any) => e.hospital_name);
  const workPlaces = profile?.work_places || [];
  const pendingHospitals = workPlaces.filter((wp: any) => !checkedInHospitals.includes(wp.hospital));

  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Activity },
    { id: 'checkin', label: 'Check-in', icon: ClipboardCheck },
    { id: 'evolution', label: 'Relatórios', icon: TrendingUp },
    { id: 'profile', label: 'Perfil', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-32 font-sans relative overflow-x-hidden print:bg-white print:pb-0">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#20b2aa]/10 rounded-xl"><Activity className="text-[#20b2aa]" size={20} /></div>
            <div>
                <h1 className="font-black text-gray-900 tracking-tight leading-none text-lg">MindCare</h1>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gestão de Burnout</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 relative z-10 print:p-0 print:m-0">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-[#20b2aa] to-[#1a9089] p-8 md:p-12 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <ShieldCheck size={14} className="text-[#a0f0ed]" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Acompanhamento Profissional</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">Apoio na Enfermagem.</h2>
                <p className="text-xs md:text-sm font-medium opacity-90 leading-relaxed max-w-lg">
                  O Burnout é silencioso. O seu check-in diário permite que a unidade de saúde acompanhe de perto o seu bem-estar e atue na prevenção.
                </p>
                <button 
                  onClick={() => setActiveTab(hasFinishedToday ? 'evolution' : 'checkin')} 
                  className="bg-white text-[#20b2aa] px-6 py-3 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 mt-2 hover:shadow-xl"
                >
                  {hasFinishedToday ? <TrendingUp size={16} /> : <ClipboardCheck size={16} />} 
                  {hasFinishedToday ? 'Ver Relatórios' : 'Fazer Check-in do Turno'}
                </button>
              </div>
              <Heart className="absolute -bottom-10 -right-10 text-white/10" size={220} fill="currentColor" />
            </div>
          </div>
        )}

        {/* COMPONENTES ATUALIZADOS */}
        {activeTab === 'checkin' && <DailyEntryForm pendingHospitals={pendingHospitals} hasFinishedToday={hasFinishedToday} onComplete={() => fetchData()} />}
        {activeTab === 'evolution' && <EvolutionTab profile={profile} userEmail={userEmail} />}
        {activeTab === 'profile' && <ProfilePage profile={profile} setProfile={setProfile} />}
      </main>

      <nav className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[2rem] z-50 p-2 print:hidden">
        <div className="flex justify-between items-center">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as TabId)} className={`flex flex-col items-center gap-1 p-2.5 px-4 rounded-2xl transition-all ${activeTab === id ? 'bg-[#20b2aa] text-white shadow-md' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
              <Icon size={18} /><span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}