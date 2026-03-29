import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateBurnoutScore, classifyRisk } from '@/lib/burnout';
import { 
  Loader2, 
  Hospital, 
  Zap, 
  Gift, 
  Star, 
  Info, 
  ArrowRight, 
  Heart 
} from 'lucide-react';
import { toast } from 'sonner';

export const DailyEntryForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showIntro, setShowIntro] = useState(true); // Controla a tela de incentivo/boas-vindas
  
  // Estados de dados
  const [userHospitals, setUserHospitals] = useState<string[]>([]);
  const [checkedHospitals, setCheckedHospitals] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  
  // Métricas para a IA
  const [fatigue, setFatigue] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);

  const fetchStatus = async () => {
    setIsFetching(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Busca os hospitais cadastrados no perfil do enfermeiro
    const { data: profile } = await supabase
      .from('profiles')
      .select('hospitals')
      .eq('user_id', user.id)
      .single();
    
    const hospitals = (profile as any)?.hospitals || [];
    setUserHospitals(hospitals);

    // 2. Busca o que já foi registrado hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: entries } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);

    const checked = (entries as any[])?.map(e => e.hospital_ref) || [];
    setCheckedHospitals(checked);

    // Define automaticamente o primeiro hospital que ainda não foi feito
    const pending = hospitals.find((h: string) => !checked.includes(h));
    if (pending) {
      setSelectedHospital(pending);
    } else if (hospitals.length > 0) {
      setSelectedHospital(hospitals[0]);
    }
    
    setIsFetching(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;

    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const score = calculateBurnoutScore(fatigue, stress, sleepQuality);
    const risk_level = classifyRisk(score);

    const { error } = await supabase.from('daily_entries').insert({
      user_id: user?.id,
      hospital_ref: selectedHospital,
      fatigue,
      stress,
      sleep_quality: sleepQuality,
      score,
      risk_level,
      date: new Date().toISOString().split('T')[0]
    } as any);

    if (error) {
      console.error(error);
      toast.error("Erro ao salvar o registro no banco.");
    } else {
      toast.success(`Check-in em ${selectedHospital} concluído!`);
      setFatigue(5);
      setStress(5);
      setSleepQuality(5);
      await fetchStatus();
    }
    setIsLoading(false);
  };

  const isAllDone = userHospitals.length > 0 && userHospitals.every(h => checkedHospitals.includes(h));

  if (isFetching) {
    return (
      <div className="bg-white p-10 rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-2" size={32} />
        <p className="text-xs text-muted-foreground font-medium">Sincronizando seus vínculos...</p>
      </div>
    );
  }

  // TELA DE BOAS-VINDAS / INCENTIVO (Aparece primeiro)
  if (showIntro && !isAllDone) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto shadow-sm">
          <Gift className="text-primary" size={32} />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900">Programa de Reconhecimento</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Sua saúde mental é prioridade. Complete seus check-ins semanais e ganhe bonificações exclusivas da gestão hospitalar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-start gap-3">
            <div className="mt-1"><Star className="text-yellow-500 fill-yellow-500" size={16} /></div>
            <div>
              <p className="text-xs font-black text-gray-800 uppercase">Assiduidade</p>
              <p className="text-[11px] text-gray-500">Mantenha a frequência e acumule pontos para bônus.</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-start gap-3">
            <div className="mt-1"><Info className="text-primary" size={16} /></div>
            <div>
              <p className="text-xs font-black text-gray-800 uppercase">Prevenção</p>
              <p className="text-[11px] text-gray-500">Identificamos o cansaço antes dele virar um problema.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowIntro(false)}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 flex justify-center items-center gap-3 group transition-all active:scale-95"
        >
          INICIAR CHECK-IN DO DIA
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  if (isAllDone) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-green-50 shadow-sm flex flex-col items-center text-center space-y-5 animate-in zoom-in duration-500">
        <img src="/select.gif" alt="Sucesso" className="w-24 h-24 object-contain" />
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900">Check-in Finalizado!</h3>
          <div className="flex items-center justify-center gap-2 text-[#20b2aa]">
            <Heart size={16} fill="currentColor" />
            <p className="font-bold">Todos os registros concluídos. Cuide-se!</p>
          </div>
        </div>
        <button 
          onClick={() => fetchStatus()}
          className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline"
        >
          Sincronizar Histórico
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
          <Hospital className="text-primary" size={28} />
        </div>
        <div>
          <h2 className="font-black text-gray-900 text-2xl tracking-tight">Registro de Plantão</h2>
          <p className="text-xs text-muted-foreground font-medium">Informe seu estado para a unidade selecionada.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Unidade Hospitalar</label>
          <select 
            value={selectedHospital} 
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-sm"
          >
            {userHospitals.map((h) => (
              <option key={h} value={h} disabled={checkedHospitals.includes(h)}>
                {h} {checkedHospitals.includes(h) ? ' (Concluído ✅)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-10 pt-4">
          <MetricSlider label="Nível de Cansaço" value={fatigue} onChange={setFatigue} color="text-orange-500" />
          <MetricSlider label="Nível de Estresse" value={stress} onChange={setStress} color="text-red-500" />
          <MetricSlider label="Qualidade do Sono" value={sleepQuality} onChange={setSleepQuality} color="text-blue-500" />
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !selectedHospital} 
          className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-50 mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Zap size={20} className="fill-current" />}
          <span>REGISTRAR PLANTÃO</span>
        </button>
      </div>
    </form>
  );
};

const MetricSlider = ({ label, value, onChange, color }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-end">
      <label className="text-sm font-black text-gray-600 uppercase tracking-tighter">{label}</label>
      <span className={`text-2xl font-black ${color}`}>{value}<span className="text-[10px] text-gray-400">/10</span></span>
    </div>
    <input 
      type="range" min="0" max="10" step="1"
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary" 
    />
  </div>
);