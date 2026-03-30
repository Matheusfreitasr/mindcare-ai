import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Hospital, Camera, Edit3, Loader2, ShieldCheck, Mail, Target, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data }: any = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setProfile(data || { display_name: '', hospitals: [], shift: '' });
    } catch (error) {
      toast.error("Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-[#20b2aa]"/></div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* CARD SUPERIOR: IDENTIDADE */}
      <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#20b2aa]/5 to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-tr from-[#20b2aa] to-[#a0f0ed] p-1 shadow-xl">
            <div className="w-full h-full rounded-[3.2rem] bg-white overflow-hidden flex items-center justify-center border-4 border-white">
              <User size={54} className="text-gray-200" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-3 rounded-2xl text-[#20b2aa] shadow-lg border border-gray-100"><Camera size={18}/></div>
        </div>

        <div className="text-center z-10 space-y-1">
          <h2 className="text-3xl font-black text-gray-950 tracking-tighter">
            Olá, <span className="text-[#20b2aa]">{profile?.display_name?.split(' ')[0] || 'Profissional'}!</span>
          </h2>
          <div className="flex items-center gap-2 justify-center mt-3 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100/50">
            <ShieldCheck size={14} className="text-emerald-500" />
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Enfermeiro Verificado SLZ</p>
          </div>
        </div>
      </div>

      {/* LISTA DE HOSPITAIS (VÍNCULOS) */}
      <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-6">
        <div className="flex items-center justify-between ml-2">
            <div className="flex items-center gap-3">
                <Hospital size={18} className="text-[#20b2aa]" />
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vínculos de Trabalho</h4>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase">{profile?.hospitals?.length || 0} Unidades</p>
        </div>
        <div className="flex flex-wrap gap-2.5 p-5 bg-gray-50/50 rounded-[2.5rem] border border-gray-100/50">
          {profile?.hospitals?.length > 0 ? (
            profile.hospitals.map((h: string) => (
              <span key={h} className="px-5 py-3 bg-white text-gray-700 rounded-2xl text-[10px] font-black uppercase border border-gray-100 shadow-sm flex items-center gap-2">
                <Target size={12} className="text-[#20b2aa]/60"/> {h}
              </span>
            ))
          ) : (
            <p className="text-[10px] text-gray-400 font-extrabold uppercase p-4 text-center w-full">Nenhum hospital vinculado.</p>
          )}
        </div>
      </div>

      {/* DADOS SALVOS */}
      <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50 space-y-8 relative">
        <div className="grid md:grid-cols-2 gap-4">
            <DataCard icon={Mail} label="Nome Completo" value={profile?.display_name || 'Não informado'} />
            <DataCard icon={CheckCircle2} label="Turno" value={profile?.shift || 'Noturno'} />
            <DataCard icon={Phone} label="Emergência" value={profile?.emergency_contact || 'Não cadastrado'} />
        </div>
        <button className="w-full bg-[#1a1a1a] text-white py-7 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
          Atualizar Perfil Completo
        </button>
      </div>
    </div>
  );
}

function DataCard({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100">
        <div className="p-3 bg-white text-gray-300 rounded-xl shadow-sm border border-gray-100"><Icon size={16} /></div>
        <div>
            <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
            <p className="font-bold text-gray-800 text-sm">{value}</p>
        </div>
    </div>
  );
}