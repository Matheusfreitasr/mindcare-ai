import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Lock, Hospital, Clock, Phone, ArrowRight, Loader2, Target, Edit3 } from 'lucide-react';

const HOSPITAIS_SLZ = [
  "Socorrão I", "Socorrão II", "Hospital UDI", "Hospital São Domingos", 
  "Santa Casa", "HUUFMA", "Hospital Carlos Macieira", "Genésio Rêgo"
];

// Componente de Input separado para corrigir o erro de digitação
const InputField = ({ icon: Icon, ...props }: any) => (
  <div className="relative group">
    <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#20b2aa] transition-colors" size={20} />
    <input 
      className="w-full p-5 pl-16 bg-gray-50 rounded-full font-semibold outline-none border-2 border-transparent focus:border-[#20b2aa]/20 focus:bg-white focus:shadow-inner transition-all duration-300" 
      {...props} 
    />
  </div>
);

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Estados do Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
  const [customHospital, setCustomHospital] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [shift, setShift] = useState('');
  const [isOnCall, setIsOnCall] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lógica do botão "Próximo"
    if (isSignUp && step === 1) {
        if (!name || !email || !password) {
            toast.error("Preencha todos os campos para continuar.");
            return;
        }
        setStep(2);
        return;
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        // Validação do Passo 2
        const finalHospitals = [...selectedHospitals];
        if (customHospital) finalHospitals.push(customHospital);

        if (finalHospitals.length === 0 || !shift) {
            toast.error("Selecione pelo menos um hospital e seu turno.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
          email, password,
          options: { 
            data: { 
                display_name: name, 
                hospitals: finalHospitals, 
                shift, 
                is_on_call: isOnCall
            } 
          }
        });
        if (error) throw error;
        toast.success("Perfil MindCare criado! Agora gerencie seus dados.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate('/');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSelect = (h: string) => {
    if (h === 'Outros') {
        setShowCustomInput(!showCustomInput);
        if (!showCustomInput) setCustomHospital(''); // Limpa se desmarcar
        return;
    }
    
    if (selectedHospitals.includes(h)) {
        setSelectedHospitals(selectedHospitals.filter(x => x !== h));
    } else {
        setSelectedHospitals([...selectedHospitals, h]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col md:flex-row font-sans">
      {/* Esquerda: Banner - Mais moderno e fluido */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#20b2aa] to-[#1a9089] p-20 flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
          <div className="flex items-center gap-4">
             <img src="/pwa-192x192.png" alt="Logo" className="w-16 h-16 brightness-0 invert" />
             <h1 className="text-5xl font-black tracking-tighter">MindCare IA</h1>
          </div>
          <h2 className="text-6xl font-black leading-[1.1] tracking-tight">Cuide de você,<br/>enquanto cuida<br/>dos outros.</h2>
          <p className="text-xl opacity-90 italic max-w-lg leading-relaxed">"A inteligência artificial monitorando seu bem-estar para prever o cansaço e a exaustão."</p>
          
          <div className="flex items-center gap-3 p-5 bg-white/10 rounded-[2rem] border border-white/20 backdrop-blur-sm max-w-sm">
             <Target className="text-white/80" size={28}/>
             <p className="text-xs font-medium text-white/90">Foco na saúde ocupacional dos profissionais de saúde em São Luís.</p>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[10rem]" />
      </div>

      {/* Direita: Form - Arredondado, Fluido e Visual */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-1000">
        <div className="w-full max-w-xl bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-gray-50/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-950 uppercase tracking-tighter">
              {isSignUp ? (step === 1 ? 'Criar Perfil' : 'Sua Rotina') : 'Bem-vindo'}
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-3">Passo {step} de 2</p>
            <div className="h-1.5 w-16 bg-gradient-to-r from-[#20b2aa] to-[#a0f0ed] mx-auto mt-4 rounded-full" />
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <InputField icon={User} required placeholder="Nome Completo" value={name} onChange={(e: any) => setName(e.target.value)} />
                <InputField icon={Mail} required type="email" placeholder="E-mail Profissional" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <InputField icon={Lock} required type="password" placeholder="Defina sua Senha" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                <button type="submit" className="w-full bg-[#20b2aa] text-white py-5 rounded-full font-black flex justify-center items-center gap-3 shadow-lg shadow-[#20b2aa]/20 hover:shadow-[#20b2aa]/40 active:scale-[0.98] transition-all duration-300">
                    PRÓXIMO PASSO <ArrowRight size={20}/></button>
              </div>
            )}

            {isSignUp && step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 ml-4">
                     <Hospital className="text-[#20b2aa]" size={16} />
                     <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Onde você trabalha? (Selecione 1 ou mais)</label>
                  </div>
                  <div className="flex flex-wrap gap-2.5 p-2 bg-gray-50/50 rounded-3xl border border-gray-100/50 relative overflow-hidden">
                    {[...HOSPITAIS_SLZ, "Outros"].map(h => (
                      <button key={h} type="button" onClick={() => handleHospitalSelect(h)}
                        className={`px-5 py-3 rounded-full text-[11px] font-extrabold uppercase transition-all duration-300 flex items-center gap-2 ${selectedHospitals.includes(h) || (h === 'Outros' && showCustomInput) ? 'bg-[#20b2aa] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#20b2aa]/20 hover:text-gray-600'}`}>
                        {h} {(selectedHospitals.includes(h) || (h === 'Outros' && showCustomInput)) && <Target size={12}/>}
                      </button>
                    ))}
                  </div>
                  {showCustomInput && (
                    <div className="relative animate-in fade-in slide-in-from-top-2 duration-300 mt-2">
                      <Edit3 className="absolute left-6 top-1/2 -translate-y-1/2 text-[#20b2aa]" size={18}/>
                      <input 
                        placeholder="Digite o nome do hospital não listado"
                        value={customHospital}
                        onChange={(e: any) => setCustomHospital(e.target.value)}
                        className="w-full p-4 pl-16 bg-white rounded-full font-semibold outline-none border-2 border-[#20b2aa]/20 focus:border-[#20b2aa]/50 focus:shadow-inner transition-all duration-300 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 items-center">
                    <div className="relative group">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#20b2aa] transition-colors" size={20} />
                        <select required value={shift} onChange={(e: any) => setShift(e.target.value)} className="w-full p-5 pl-16 bg-gray-50 rounded-full font-semibold outline-none border-2 border-transparent focus:border-[#20b2aa]/20 focus:bg-white appearance-none text-gray-600 focus:text-gray-900 transition-all text-sm">
                            <option value="">Selecione seu Turno...</option>
                            <option value="Matutino">Matutino</option>
                            <option value="Vespertino">Vespertino</option>
                            <option value="Noturno">Noturno</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gray-50 rounded-full border-2 border-transparent focus-within:border-[#20b2aa]/20">
                        <span className="text-xs font-bold text-gray-500 ml-2">Faz Plantão?</span>
                        <input type="checkbox" checked={isOnCall} onChange={(e: any) => setIsOnCall(e.target.checked)} className="w-6 h-6 rounded-lg border-gray-200 text-[#20b2aa] focus:ring-[#20b2aa]/20 accent-[#20b2aa]" />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-gray-200 hover:text-gray-500 active:scale-95 transition-all">Voltar</button>
                  <button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-br from-[#20b2aa] to-[#1a9089] text-white py-5 rounded-full font-black flex justify-center items-center uppercase text-[11px] tracking-widest shadow-xl shadow-[#20b2aa]/30 hover:shadow-[#20b2aa]/50 active:scale-[0.98] disabled:opacity-50 transition-all">
                    {loading ? <Loader2 className="animate-spin"/> : 'Finalizar Perfil'}
                  </button>
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="space-y-6">
                <InputField icon={Mail} required type="email" placeholder="E-mail Profissional" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                <InputField icon={Lock} required type="password" placeholder="Sua Senha" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-br from-[#20b2aa] to-[#1a9089] text-white py-6 rounded-full font-black uppercase tracking-widest shadow-xl shadow-[#20b2aa]/30 hover:shadow-[#20b2aa]/50 transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Entrar'}</button>
              </div>
            )}
          </form>

          <button onClick={() => {setIsSignUp(!isSignUp); setStep(1);}} className="w-full mt-10 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-[#20b2aa] transition-colors">
            {isSignUp ? 'Já tem conta? Faça Login' : 'Não tem conta? Crie aqui'}
          </button>
        </div>
      </div>
    </div>
  );
}