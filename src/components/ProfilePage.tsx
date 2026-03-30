import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Hospital, Phone, ShieldAlert, Save, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

const HOSPITAIS_SLZ = ["Socorrão I", "Socorrão II", "UDI", "São Domingos", "Santa Casa", "HUUFMA", "Carlos Macieira"];

export function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({ display_name: '', hospitals: [], emergency_contact: '', phone: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
    if (data) setProfile(data);
    setLoading(false);
  }

  async function handleUpdate() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update(profile).eq('id', user?.id);
    if (!error) toast.success("Dados atualizados!");
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#20b2aa]" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 animate-in fade-in duration-700">
      {/* HEADER IDENTIDADE */}
      <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-50 flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-[3rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative">
          <User size={48} className="text-gray-200" />
          <button className="absolute -bottom-2 -right-2 bg-[#20b2aa] p-3 rounded-2xl text-white shadow-lg"><Camera size={16}/></button>
        </div>
        <div className="flex-1 space-y-4 w-full">
          <h3 className="text-[10px] font-black text-[#20b2aa] uppercase tracking-[0.3em]">Dados Pessoais</h3>
          <input value={profile.display_name} onChange={e => setProfile({...profile, display_name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border-none outline-none focus:ring-2 focus:ring-[#20b2aa]/10" placeholder="Nome Completo" />
          <div className="grid grid-cols-2 gap-4">
             <div className="relative">
               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
               <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full p-4 pl-10 bg-gray-50 rounded-2xl font-bold text-xs" placeholder="Seu Telefone" />
             </div>
             <div className="relative">
               <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-red-300" size={14} />
               <input value={profile.emergency_contact} onChange={e => setProfile({...profile, emergency_contact: e.target.value})} className="w-full p-4 pl-10 bg-gray-50 rounded-2xl font-bold text-xs" placeholder="Ctt Emergência" />
             </div>
          </div>
        </div>
      </div>

      {/* GESTÃO DE HOSPITAIS */}
      <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-50 space-y-6">
        <div className="flex items-center gap-3">
          <Hospital className="text-[#20b2aa]" size={20} />
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Rede de Trabalho (São Luís)</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {HOSPITAIS_SLZ.map(h => (
            <button key={h} onClick={() => {
              const newList = profile.hospitals?.includes(h) ? profile.hospitals.filter((x:any) => x !== h) : [...(profile.hospitals || []), h];
              setProfile({...profile, hospitals: newList});
            }} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${profile.hospitals?.includes(h) ? 'bg-[#20b2aa] text-white shadow-lg' : 'bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200'}`}>
              {h}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleUpdate} disabled={saving} className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black shadow-2xl flex justify-center items-center gap-4 active:scale-[0.98] transition-all">
        {saving ? <Loader2 className="animate-spin"/> : <><Save size={20}/> SALVAR CONFIGURAÇÕES</>}
      </button>
    </div>
  );
}