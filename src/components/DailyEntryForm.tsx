import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, Heart, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function SliderField({ label, value, onChange, minL, maxL, colorClass }: any) {
  return (
    <div className="space-y-4 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-all shadow-sm hover:shadow-md">
      <div className="flex justify-between items-center px-2">
        <span className="font-black text-gray-700 uppercase text-[10px] tracking-widest">{label}</span>
        <span className={`text-2xl font-black ${colorClass}`}>{Math.round(value)}<span className="text-[10px] text-gray-300">/10</span></span>
      </div>
      <input type="range" min="0" max="10" value={value} onChange={e => onChange(parseInt(e.target.value))} 
             className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#20b2aa]" />
      <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
        <span>{minL} (0)</span><span>{maxL} (10)</span>
      </div>
    </div>
  );
}

export function DailyEntryForm({ userName, hasCheckedInTodayProp, onComplete }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fatigue, setFatigue] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (hasCheckedInTodayProp) {
        setIsCompleted(true);
        setLoading(false);
    } else {
        checkIfAlreadyDone();
    }
  }, [hasCheckedInTodayProp]);

  async function checkIfAlreadyDone() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from('daily_entries')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const d = new Date(data.date);
        const today = new Date();
        if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
          setIsCompleted(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted || hasCheckedInTodayProp) return; // Trava dupla
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const score = Math.round(((10 - fatigue) + (10 - stress) + sleep) / 3 * 10);
      let risk = fatigue > 7 || stress > 7 ? 'alto' : (fatigue > 4 || stress > 4 ? 'médio' : 'baixo');

      const { error } = await supabase.from('daily_entries').insert({
        user_id: user.id, fatigue, stress, sleep_quality: sleep,
        date: new Date().toISOString(), score, risk_level: risk
      });

      if (error) throw error;
      
      setIsCompleted(true);
      toast.success("Check-in concluído! Boa jornada.");
      setTimeout(() => { if (onComplete) onComplete(); }, 1500);

    } catch (error: any) {
      toast.error("Erro ao registrar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20 min-h-[400px] items-center"><Loader2 className="animate-spin text-[#20b2aa]" size={40}/></div>;

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-10 md:p-12 bg-white rounded-[4rem] shadow-2xl border border-gray-50 text-center space-y-8 animate-in zoom-in-95 duration-700 relative overflow-hidden">
        <Sparkles className="absolute top-10 left-10 text-[#20b2aa]/20" size={40} />
        <div className="w-40 h-40 mx-auto rounded-[2.5rem] bg-[#f0fdfa] flex items-center justify-center shadow-inner overflow-hidden border-4 border-white p-2">
          <img src="/select.gif" alt="Check-in finalizado" className="w-full h-full object-cover rounded-3xl" />
        </div>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 justify-center"><CheckCircle2 className="text-[#20b2aa]" size={20} /><span className="text-[11px] font-black text-[#20b2aa] uppercase tracking-[0.4em]">Registro Diário Concluído</span></div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">Olá, {userName?.split(' ')[0] || 'Profissional'}!</h2>
          <div className="max-w-xs mx-auto py-6 px-4 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-3 shadow-inner">
            <p className="text-sm font-bold text-gray-500 leading-relaxed">Você já realizou o seu check-in de hoje. Seus dados estão processados na IA.</p>
            <div className="flex items-center gap-2 justify-center text-red-500"><Heart size={16} className="fill-red-500 animate-pulse" /><span className="text-xs font-black uppercase tracking-widest">Até amanhã!</span></div>
          </div>
          <button onClick={onComplete} className="mt-4 bg-[#20b2aa]/10 text-[#20b2aa] px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#20b2aa]/20 transition-colors inline-flex items-center gap-2">
             <TrendingUp size={14}/> Ver minha Evolução
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[4rem] shadow-2xl border border-gray-50 space-y-8">
        <div className="text-center mb-6"><p className="text-[10px] font-black text-[#20b2aa] uppercase tracking-[0.4em]">Diário de Saúde IA</p></div>
        <div className="space-y-6">
          <SliderField label="Nível de Cansaço" value={fatigue} onChange={setFatigue} colorClass="text-orange-500" minL="Energizado" maxL="Exausto" />
          <SliderField label="Nível de Estresse" value={stress} onChange={setStress} colorClass="text-red-500" minL="Tranquilo" maxL="No Limite" />
          <SliderField label="Qualidade do Sono" value={sleep} onChange={setSleep} colorClass="text-[#20b2aa]" minL="Péssima" maxL="Excelente" />
        </div>
        <button disabled={saving} type="submit" className="w-full bg-[#20b2aa] text-white py-7 rounded-full font-black shadow-xl hover:shadow-[#20b2aa]/40 flex justify-center items-center gap-4 transition-all active:scale-95 text-sm uppercase tracking-widest">
          {saving ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Guardar Análise de Hoje</>}
        </button>
      </form>
    </div>
  );
}