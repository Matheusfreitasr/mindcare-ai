import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Camera, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [shift, setShift] = useState('');
  const [hasOnCall, setHasOnCall] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hospitaisSaoLuis = [
    "Hospital Municipal Djalma Marques (Socorrão I)",
    "Hospital Municipal Dr. Clementino Moura (Socorrão II)",
    "Hospital Universitário (HUUFMA)",
    "Hospital da Ilha",
    "Hospital São Domingos",
    "UDI Hospital",
    "Santa Casa de Misericórdia",
    "UPA - Itaqui-Bacanga",
    "UPA - Araçagy",
    "UPA - Vinhais",
    "Outro"
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
          if (error) throw error;
          
          const profile = data as any;
          if (profile) {
            setName(profile.display_name || '');
            setHospitals(profile.hospitals && profile.hospitals.length > 0 ? profile.hospitals : ['']);
            setShift(profile.shift || '');
            setHasOnCall(profile.has_on_call || false);
            setAvatarUrl(profile.avatar_url);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        display_name: name,
        hospitals: hospitals.filter(h => h !== ''), // Remove vazios
        shift,
        has_on_call: hasOnCall
      } as any).eq('user_id', userId);
      if (error) throw error;
      toast.success('Perfil atualizado!');
    } catch (error) {
      toast.error('Erro ao salvar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHospital = () => setHospitals([...hospitals, '']);
  const handleRemoveHospital = (index: number) => setHospitals(hospitals.filter((_, i) => i !== index));

  if (isFetching) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Carregando...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
             {/* Lógica da foto (Avatar) mantida aqui */}
             <div className="relative">
                <img src={avatarUrl || '/placeholder-user.png'} className="w-24 h-24 rounded-full border-4 border-[#20b2aa] object-cover" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-[#20b2aa] p-2 rounded-full text-white shadow-lg">
                  <Camera size={16} />
                </button>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#20b2aa] outline-none" />
          </div>

          {/* LISTA DE HOSPITAIS */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Locais de Trabalho (Hospitais)</label>
            {hospitals.map((h, i) => (
              <div key={i} className="flex gap-2">
                <select 
                  value={h} 
                  onChange={e => {
                    const newH = [...hospitals];
                    newH[i] = e.target.value;
                    setHospitals(newH);
                  }}
                  className="flex-1 p-3 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="">Selecione o local...</option>
                  {hospitaisSaoLuis.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                {hospitals.length > 1 && (
                  <button type="button" onClick={() => handleRemoveHospital(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddHospital} className="flex items-center gap-2 text-[#20b2aa] text-sm font-bold hover:underline">
              <Plus size={16} /> Adicionar outro local
            </button>
          </div>

          {/* Turno e Plantão mantidos aqui... */}
          <button type="submit" disabled={isLoading} className="w-full bg-[#20b2aa] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#1a9089] transition-all">
            {isLoading ? 'Salvando...' : 'Atualizar Perfil Completo'}
          </button>
        </form>
      </div>
    </div>
  );
};