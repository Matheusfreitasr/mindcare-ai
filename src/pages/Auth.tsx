import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Lock, Hospital, Clock, ArrowRight, Loader2, Edit3, Heart, Sparkles, Briefcase } from 'lucide-react';

const HOSPITAIS_SLZ = ["Socorrão I", "Socorrão II", "Hospital UDI", "Hospital São Domingos", "Santa Casa", "HUUFMA", "Carlos Macieira"];

const InputField = ({ icon: Icon, ...props }: any) => (
  <div className="relative group flex items-center bg-gray-50 rounded-full border-2 border-transparent focus-within:border-[#20b2aa]/20 focus-within:bg-white focus-within:shadow-inner transition-all duration-300 h-[64px]">
    <Icon className="absolute left-6 text-gray-300 group-focus-within:text-[#20b2aa] transition-colors" size={20} />
    <input className="w-full h-full p-5 pl-16 bg-transparent rounded-full font-semibold outline-none text-gray-600 focus:text-gray-900 appearance-none text-sm" {...props} />
  </div>
);

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [hospitalSettings, setHospitalSettings] = useState<Record<string, { shift: string, isOnCall: boolean }>>({});
  const [customName, setCustomName] = useState('');

  const handleHospitalSelect = (h: string) => {
    if (selectedHospitals.includes(h)) {
        setSelectedHospitals(prev => prev.filter(x => x !== h));
        const newSettings = {...hospitalSettings};
        delete newSettings[h];
        setHospitalSettings(newSettings);
    } else {
        setSelectedHospitals(prev => [...prev, h]);
        setHospitalSettings(prev => ({...prev, [h]: { shift: '', isOnCall: false }}));
    }
  };

  const updateSetting = (h: string, field: 'shift' | 'isOnCall', value: any) => {
      setHospitalSettings(prev => ({...prev, [h]: { ...prev[h], [field]: value }}));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && step === 1) {
        if (!name || !email || !password) return toast.error("Preencha todos os campos.");
        setStep(2);
        return;
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        if (selectedHospitals.length === 0) {
            setLoading(false);
            return toast.error("Selecione pelo menos um local de trabalho.");
        }

        const workPlaces = selectedHospitals.map(h => ({
            hospital: h === 'Outros' ? (customName || 'Não Informado') : h,
            shift: hospitalSettings[h]?.shift || 'Não Informado',
            isOnCall: hospitalSettings[h]?.isOnCall || false
        }));

        if (workPlaces.some(w => w.shift === 'Não Informado' || w.shift === '')) {
            setLoading(false);
            return toast.error("Por favor, selecione o turno para cada hospital.");
        }

        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name, work_places: workPlaces } }
        });
        
        if (error) throw error;

        // GARANTIA MÁXIMA: Tenta salvar na tabela profiles logo após o Auth
        if (data?.user) {
            await supabase.from('profiles').update({
                display_name: name,
                work_places: workPlaces
            }).eq('id', data.user.id);
        }

        toast.success("Perfil MindCare criado com sucesso!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate('/');
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col md:flex-row font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-[#20b2aa]/5 rounded-full blur-[10rem] -translate-y-1/2 translate-x-1/3" />
      
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#20b2aa] to-[#1a9089] p-20 flex-col justify-center text-white relative z-10">
        <div className="relative z-10 space-y-8 animate-in fade-in duration-700">
          <div className="flex items-center gap-4"><img src="/pwa-192x192.png" alt="Logo" className="w-16 h-16 brightness-0 invert" /><h1 className="text-5xl font-black">MindCare IA</h1></div>
          <h2 className="text-6xl font-black leading-[1.1]">Cuide de você,<br/>enquanto cuida<br/>dos outros.</h2>
          <div className="max-w-md py-6 px-5 bg-white/10 rounded-[2.5rem] border border-white/20 space-y-3 relative overflow-hidden backdrop-blur-md">
              <Sparkles className="absolute -top-3 -right-3 text-orange-300 animate-pulse" size={40} />
              <div className="flex items-center gap-2"><Heart className="text-red-300 fill-red-300" size={16} /><p className="text-[11px] font-black uppercase tracking-[0.3em] text-red-100">Dever Cumprido = Recompensa</p></div>
              <p className="text-lg font-bold italic text-white">"Seu check-in diário acumula pontos e bonificações para sua carreira na rede de saúde de São Luís."</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-xl bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50/50 animate-in fade-in duration-1000 my-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-950 uppercase">{isSignUp ? (step === 1 ? 'Criar Perfil' : 'Sua Rotina') : 'Bem-vindo'}</h2>
            <div className="h-1.5 w-16 bg-gradient-to-r from-[#20b2aa] to-[#a0f0ed] mx-auto mt-4 rounded-full" />
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && step === 1 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                 <InputField icon={User} required placeholder="Nome Completo" value={name} onChange={(e: any) => setName(e.target.value)} />
                 <InputField icon={Mail} required type="email" placeholder="E-mail Profissional" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                 <InputField icon={Lock} required type="password" placeholder="Defina sua Senha" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                 <button type="submit" className="w-full bg-[#20b2aa] text-white py-5 rounded-full font-black flex justify-center items-center gap-3 shadow-lg hover:shadow-[#20b2aa]/40 active:scale-95 transition-all uppercase tracking-widest text-sm">PRÓXIMO PASSO <ArrowRight size={20}/></button>
               </div>
            )}
            
            {isSignUp && step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-4 flex items-center gap-2"><Hospital className="text-[#20b2aa]" size={16} /> Onde você trabalha?</label>
                  <div className="flex flex-wrap gap-2.5 p-2 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                    {[...HOSPITAIS_SLZ, "Outros"].map(h => (
                      <button key={h} type="button" onClick={() => handleHospitalSelect(h)} className={`px-4 py-2.5 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-2 ${selectedHospitals.includes(h) ? 'bg-[#20b2aa] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#20b2aa]/20'}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedHospitals.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="text-[11px] font-bold text-[#20b2aa] uppercase tracking-widest ml-4">Configure seus turnos:</label>
                        {selectedHospitals.map(h => (
                            <div key={h} className="bg-gray-50 p-4 rounded-[2rem] border border-gray-100 space-y-3">
                                {h === 'Outros' ? (
                                    <div className="relative">
                                        <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#20b2aa]" size={16}/>
                                        <input required placeholder="Nome do seu Hospital..." value={customName} onChange={e => setCustomName(e.target.value)} className="w-full p-3 pl-12 bg-white rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-[#20b2aa]/20 border border-gray-100"/>
                                    </div>
                                ) : (
                                    <p className="font-black text-gray-800 uppercase tracking-tight text-xs ml-2 flex items-center gap-2"><Briefcase size={14} className="text-[#20b2aa]"/> {h}</p>
                                )}
                                <div className="flex items-center gap-3">
                                    <select required value={hospitalSettings[h]?.shift || ''} onChange={e => updateSetting(h, 'shift', e.target.value)} className="flex-1 p-3 bg-white rounded-xl font-bold text-xs outline-none border border-gray-100 focus:ring-2 focus:ring-[#20b2aa]/20 text-gray-600">
                                        <option value="">Turno...</option><option value="Matutino">Matutino</option><option value="Vespertino">Vespertino</option><option value="Noturno">Noturno</option>
                                    </select>
                                    <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-500">Plantão?</span>
                                        <input type="checkbox" checked={hospitalSettings[h]?.isOnCall || false} onChange={e => updateSetting(h, 'isOnCall', e.target.checked)} className="w-4 h-4 rounded text-[#20b2aa] accent-[#20b2aa]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-full font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Voltar</button>
                  <button type="submit" disabled={loading} className="flex-[2] bg-[#20b2aa] text-white py-4 rounded-full font-black flex justify-center items-center uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all hover:bg-[#1a9089]">
                    {loading ? <Loader2 className="animate-spin"/> : 'Finalizar Cadastro'}
                  </button>
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="space-y-6">
                <InputField icon={Mail} required type="email" placeholder="E-mail Profissional" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <InputField icon={Lock} required type="password" placeholder="Sua Senha" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                <button type="submit" disabled={loading} className="w-full bg-[#20b2aa] text-white py-5 rounded-full font-black uppercase tracking-widest shadow-xl transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Entrar'}</button>
              </div>
            )}
          </form>

          <button onClick={() => {setIsSignUp(!isSignUp); setStep(1);}} className="w-full mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#20b2aa] transition-colors">
            {isSignUp ? 'Já tem conta? Faça Login' : 'Não tem conta? Crie aqui'}
          </button>
        </div>
      </div>
    </div>
  );
}