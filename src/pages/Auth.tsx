import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Gift, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  Loader2, 
  Mail, 
  Lock, 
  User 
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { session } = useAuth();

  // Se o usuário já estiver logado, manda direto para o Dashboard
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // CADASTRO INSTANTÂNEO (Sem confirmação de e-mail no Supabase)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name }
          }
        });
        
        if (error) throw error;

        // Se o cadastro retornar sessão (configuração atual), loga na hora
        if (data?.session) {
          toast.success('Perfil criado com sucesso! Bem-vindo ao MindCare IA.');
          navigate('/');
        } else {
          toast.success('Cadastro realizado! Agora é só entrar.');
          setIsSignUp(false);
        }
      } else {
        // LOGIN PROFISSIONAL
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Bem-vindo de volta ao MindCare IA!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex flex-col md:flex-row font-sans">
      
      {/* Lado Esquerdo: Banner de Impacto Social */}
      <div className="hidden md:flex md:w-1/2 bg-[#20b2aa] p-16 flex-col justify-center text-white space-y-10 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <img src="/pwa-192x192.png" className="w-14 h-14 brightness-0 invert shadow-lg" alt="Logo" />
          <h1 className="text-4xl font-black tracking-tighter">MindCare IA</h1>
        </div>
        
        <div className="space-y-6 relative z-10">
          <h2 className="text-6xl font-black leading-[1.1] tracking-tight">
            Cuide de você, <br /> enquanto cuida <br /> dos outros.
          </h2>
          <p className="text-xl opacity-90 font-medium leading-relaxed max-w-lg italic">
            "A IA monitorando seu bem-estar para prever o cansaço e a gestão te premiando por se cuidar."
          </p>
        </div>

        <div className="grid gap-6 relative z-10">
          <div className="flex items-center gap-5 bg-white/10 p-6 rounded-[2rem] backdrop-blur-xl border border-white/20 shadow-xl">
            <Gift size={28} />
            <div>
              <p className="font-bold text-lg leading-none mb-1">Ganhe Recompensas</p>
              <p className="text-xs opacity-80 font-medium italic">Folgas e bônus por sua assiduidade.</p>
            </div>
          </div>
          <div className="flex items-center gap-5 bg-white/10 p-6 rounded-[2rem] backdrop-blur-xl border border-white/20 shadow-xl">
            <ShieldCheck size={28} />
            <div>
              <p className="font-bold text-lg leading-none mb-1">Segurança e Sigilo</p>
              <p className="text-xs opacity-80 font-medium italic">Seus dados clínicos são protegidos em São Luís.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário de Acesso */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-gray-50">
          
          <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
            <button 
              onClick={() => setIsSignUp(true)} 
              className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${isSignUp ? 'bg-white shadow-md text-[#20b2aa]' : 'text-gray-400'}`}
            >
              Criar Perfil
            </button>
            <button 
              onClick={() => setIsSignUp(false)} 
              className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${!isSignUp ? 'bg-white shadow-md text-[#20b2aa]' : 'text-gray-400'}`}
            >
              Entrar
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#20b2aa]/10 focus:bg-white outline-none font-bold text-gray-700 transition-all" placeholder="Ex: Maria Silva" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">E-mail Profissional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#20b2aa]/10 focus:bg-white outline-none font-bold text-gray-700 transition-all" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#20b2aa]/10 focus:bg-white outline-none font-bold text-gray-700 transition-all" placeholder="••••••••" />
              </div>
            </div>

            <button 
              disabled={isLoading} 
              type="submit" 
              className="w-full bg-[#20b2aa] text-white py-5 rounded-2xl font-black shadow-2xl shadow-[#20b2aa]/30 flex justify-center items-center gap-3 hover:bg-[#1a9089] transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <span className="uppercase tracking-[0.2em]">{isSignUp ? 'Criar Perfil' : 'Acessar Conta'}</span>
              )}
            </button>
          </form>

          {isSignUp && (
            <div className="p-5 bg-[#20b2aa]/5 rounded-[2rem] border border-[#20b2aa]/10 flex items-center gap-4">
              <Award className="text-[#20b2aa]" size={22} />
              <p className="text-[10px] font-black text-[#20b2aa] uppercase leading-tight tracking-tighter">
                Entre automaticamente no Programa de Reconhecimento MindCare IA!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}