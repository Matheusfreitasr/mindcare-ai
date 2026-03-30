import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function DailyEntryForm() {
  const [loading, setLoading] = useState(false);
  const [fatigue, setFatigue] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userName, setUserName] = useState(''); // Estado para o seu nome

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // BUSCA O NOME DIRETAMENTE NO PERFIL
    const { data: profile }: any = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();
    
    // Pega o primeiro nome (ex: "Matheus")
    if (profile?.display_name) {
      setUserName(profile.display_name.split(' ')[0]);
    }

    // Verifica se já registrou hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('daily_entries')
      .select('id')
      .eq('user_id', user.id)
      .gte('date', `${today}T00:00:00`)
      .lte('date', `${today}T23:59:59`)
      .maybeSingle();

    if (existing) setIsCompleted(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile }: any = await supabase.from('profiles').select('hospitals').eq('id', user?.id).single();
      
      const hospitalVinculado = profile?.hospitals?.[0] || 'Hospital não informado';
      const score = Math.round(((10 - fatigue) + (10 - stress) + sleep) / 3 * 10);
      let risk = fatigue > 7 ? 'alto' : (fatigue > 4 ? 'médio' : 'baixo');

      const { error } = await supabase.from('daily_entries').insert({
        user_id: user?.id,
        fatigue, stress, sleep_quality: sleep,
        hospital_name: hospitalVinculado,
        date: new Date().toISOString(),
        score, risk_level: risk
      });

      if (error) throw error;
      setIsCompleted(true);
      
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white rounded-[4rem] shadow-2xl border border-gray-50 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
        <Sparkles className="absolute top-10 left-10 text-[#20b2aa]/20" size={40} />
        
        <div className="w-40 h-40 mx-auto rounded-[2.5rem] bg-gray-50 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white">
          <img 
            src="/select.gif" 
            alt="Check-in finalizado" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle2 className="text-[#20b2aa]" size={20} />
            <span className="text-[11px] font-black text-[#20b2aa] uppercase tracking-[0.4em]">Registro Concluído</span>
          </div>
          
          {/* O NOME AGORA APARECE AQUI */}
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">
            Olá, {userName}!
          </h2>
          
          <div className="max-w-xs mx-auto py-6 px-4 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-3">
            <p className="text-sm font-bold text-gray-500 leading-relaxed">
              Você já cuidou da sua saúde hoje. Seus dados estão sendo analisados pela IA.
            </p>
            <div className="flex items-center gap-2 justify-center text-red-500">
               <Heart size={16} className="fill-red-500 animate-pulse" />
               <span className="text-xs font-black uppercase tracking-widest">Cuide-se, você é valioso!</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
          Obrigado por utilizar o MindCare IA. Até amanhã!
        </p>
      </div>
    );
  }

  // Código do formulário continua igual abaixo...
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50 space-y-8">
        <div className="space-y-6">
          <SliderField label="Nível de Cansaço" value={fatigue} onChange={setFatigue} color="text-orange-500" minL="Energizado" maxL="Exausto" />
          <SliderField label="Nível de Estresse" value={stress} onChange={setStress} color="text-red-500" minL="Tranquilo" maxL="No Limite" />
          <SliderField label="Qualidade do Sono" value={sleep} onChange={setSleep} color="text-blue-500" minL="Péssima" maxL="Excelente" />
        </div>
        <button disabled={loading} type="submit" className="w-full bg-[#20b2aa] text-white py-7 rounded-full font-black shadow-xl shadow-[#20b2aa]/20 flex justify-center items-center gap-4 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm text-center">
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Registrar Bem-Estar</>}
        </button>
      </form>
    </div>
  );
}

function SliderField({ label, value, onChange, color, minL, maxL }: any) {
  return (
    <div className="space-y-4 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-all">
      <div className="flex justify-between items-center px-2">
        <span className="font-black text-gray-700 uppercase text-[10px] tracking-widest">{label}</span>
        <span className={`text-2xl font-black ${color}`}>{value}<span className="text-[10px] text-gray-300">/10</span></span>
      </div>
      <input type="range" min="0" max="10" value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#20b2aa]" />
      <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
        <span>{minL} (0)</span>
        <span>{maxL} (10)</span>
      </div>
    </div>
  );
}