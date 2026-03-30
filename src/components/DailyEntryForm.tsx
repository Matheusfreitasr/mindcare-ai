import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, CheckCircle2, Building, Lock, FileText } from 'lucide-react';
import { toast } from 'sonner';

function SliderField({ label, value, onChange, minL, maxL, colorClass }: any) {
  return (
    <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white transition-all shadow-sm">
      <div className="flex justify-between items-center px-1">
        <span className="font-bold text-gray-700 uppercase text-[10px] tracking-widest">{label}</span>
        <span className={`text-lg font-black ${colorClass}`}>{Math.round(value)}<span className="text-[9px] text-gray-400">/10</span></span>
      </div>
      <input type="range" min="0" max="10" value={value} onChange={e => onChange(parseInt(e.target.value))} 
             className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#20b2aa]" />
      <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400 px-1">
        <span>{minL}</span><span>{maxL}</span>
      </div>
    </div>
  );
}

export function DailyEntryForm({ pendingHospitals = [], hasFinishedToday, onComplete }: any) {
  const [saving, setSaving] = useState(false);
  const [localFinished, setLocalFinished] = useState(false); // TRAVA IMEDIATA
  
  const [fatigue, setFatigue] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [notes, setNotes] = useState(''); // CAMPO DE TEXTO
  const [selectedWorkplace, setSelectedWorkplace] = useState('');

  useEffect(() => {
    if (pendingHospitals.length > 0) {
      if (!pendingHospitals.some((wp: any) => wp.hospital === selectedWorkplace)) {
         setSelectedWorkplace(pendingHospitals[0].hospital);
      }
    } else {
      setSelectedWorkplace('Geral');
    }
  }, [pendingHospitals]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasFinishedToday || localFinished) return; 
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const score = Math.round(((10 - fatigue) + (10 - stress) + sleep) / 3 * 10);
      let risk = fatigue > 7 || stress > 7 ? 'alto' : (fatigue > 4 || stress > 4 ? 'médio' : 'baixo');

      // Adicionado 'notes' com as any para não dar erro de TS
      await supabase.from('daily_entries').insert({
        user_id: user.id, fatigue, stress, sleep_quality: sleep,
        hospital_name: selectedWorkplace, notes,
        date: new Date().toISOString(), score, risk_level: risk
      } as any);
      
      toast.success(`Score salvo para ${selectedWorkplace}!`);
      
      setFatigue(5); setStress(5); setSleep(5); setNotes('');
      
      if (onComplete) onComplete(); 

      // Se só faltava 1 hospital, tranca o dia automaticamente
      if (pendingHospitals.length <= 1) {
         await handleFinishEarly();
      }
    } catch (error: any) {
      toast.error("Erro ao guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFinishEarly = async () => {
    setSaving(true);
    setLocalFinished(true); // TRAVA A TELA NA HORA
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('daily_entries').insert({
        user_id: user.id, fatigue: 0, stress: 0, sleep_quality: 0,
        hospital_name: 'FINALIZADO', 
        date: new Date().toISOString(), score: 0, risk_level: 'baixo'
      } as any);
      
      if (onComplete) onComplete(); 
    } catch (e) {
       toast.error("Erro ao concluir o dia.");
    } finally {
       setSaving(false);
    }
  };

  // TELA DE BLOQUEIO ABSOLUTO COM O GIF
  if (hasFinishedToday || localFinished) {
    return (
      <div className="max-w-md mx-auto p-8 md:p-10 bg-white rounded-[3rem] shadow-xl border border-gray-50 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="w-32 h-32 mx-auto rounded-3xl bg-[#f0fdfa] flex items-center justify-center shadow-inner overflow-hidden border-4 border-white p-1.5">
          <img src="/select.gif" alt="Concluído" className="w-full h-full object-cover rounded-[1.25rem]" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 justify-center"><CheckCircle2 className="text-[#20b2aa]" size={16} /><span className="text-[10px] font-black text-[#20b2aa] uppercase tracking-[0.3em]">Concluído</span></div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Check-in feito!</h2>
          <p className="text-xs font-bold text-gray-500 bg-gray-50 py-2.5 px-5 rounded-full inline-block border border-gray-100">
             Volte amanhã e cuide-se.
          </p>
        </div>
      </div>
    );
  }

  // FORMULÁRIO COMPACTO
  return (
    <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-500">
      <form onSubmit={handleSubmitScore} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-gray-50 space-y-6">
        <div className="flex items-center justify-center gap-2 mb-2">
           <FileText size={16} className="text-[#20b2aa]" />
           <p className="text-[10px] font-black text-[#20b2aa] uppercase tracking-[0.3em]">Formulário de Saúde</p>
        </div>
        
        {pendingHospitals.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
             <div className="p-2 bg-white rounded-lg text-[#20b2aa] shadow-sm"><Building size={16}/></div>
             <div className="flex-1">
                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Unidade atual</p>
                 <select value={selectedWorkplace} onChange={e => setSelectedWorkplace(e.target.value)} className="w-full bg-transparent font-black text-gray-800 outline-none text-xs cursor-pointer appearance-none">
                     {pendingHospitals.map((wp: any, idx: number) => (
                         <option key={idx} value={wp.hospital}>{wp.hospital}</option>
                     ))}
                 </select>
             </div>
          </div>
        )}

        <div className="space-y-4">
          <SliderField label="Nível de Cansaço" value={fatigue} onChange={setFatigue} colorClass="text-orange-500" minL="0" maxL="10" />
          <SliderField label="Nível de Estresse" value={stress} onChange={setStress} colorClass="text-red-500" minL="0" maxL="10" />
          <SliderField label="Qualidade do Sono" value={sleep} onChange={setSleep} colorClass="text-[#20b2aa]" minL="0" maxL="10" />
          
          {/* CAIXA DE TEXTO NOVA */}
          <div className="space-y-2">
             <span className="font-bold text-gray-700 uppercase text-[10px] tracking-widest px-2">Observações (Opcional)</span>
             <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Descreva algum evento relevante deste turno..." 
                className="w-full p-4 bg-gray-50/50 rounded-2xl border border-gray-100 outline-none focus:border-[#20b2aa]/30 text-xs font-medium text-gray-700 resize-none h-20"
             />
          </div>
        </div>

        <button disabled={saving} type="submit" className="w-full bg-[#20b2aa] text-white py-5 rounded-2xl font-black shadow-md hover:shadow-lg flex justify-center items-center gap-3 transition-all active:scale-95 text-xs uppercase tracking-widest">
          {saving ? <Loader2 className="animate-spin size-4" /> : <><Send size={16} /> Guardar Informações</>}
        </button>
      </form>

      {/* BOTÃO DE ENCERRAR O DIA (Trava a tela inteira imediatamente) */}
      <button type="button" onClick={handleFinishEarly} disabled={saving} className="w-full bg-transparent border-2 border-gray-200 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-500 transition-all flex justify-center items-center gap-2 active:scale-95">
        <Lock size={14} /> Encerrar Meu Dia (Não avaliar mais locais)
      </button>
    </div>
  );
}