import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true); // Agora começa na tela de Cadastro
  const [isLoading, setIsLoading] = useState(false);
  
  // Campos de Conta
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Campos de Perfil
  const [name, setName] = useState('');
  const [hospital, setHospital] = useState('');
  const [shift, setShift] = useState('');
  const [hasOnCall, setHasOnCall] = useState(false);

  const hospitaisSaoLuis = [
    "Hospital Municipal Djalma Marques (Socorrão I)",
    "Hospital Municipal Dr. Clementino Moura (Socorrão II)",
    "Hospital Universitário Presidente Dutra (HUUFMA)",
    "Hospital da Ilha",
    "Hospital São Domingos",
    "UDI Hospital",
    "Santa Casa de Misericórdia",
    "UPA - Itaqui-Bacanga",
    "UPA - Araçagy",
    "UPA - Vinhais",
    "Outro"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!name || !hospital || !shift) {
          toast.error("Preencha todos os campos do perfil.");
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
              hospital: hospital,
              shift: shift,
              has_on_call: hasOnCall,
            }
          }
        });
        
        if (error) throw error;
        toast.success('Perfil criado com sucesso! Você já pode acessar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#20b2aa] flex items-center justify-center shadow-lg">
            <Activity className="text-white" size={28} />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
          MindCare IA
        </h2>
        <p className="text-center text-sm text-gray-500 mt-1">
          Prevenção de Burnout | Enfermeiros São Luís-MA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
          
          {/* Abas de Navegação */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${isSignUp ? 'border-[#20b2aa] text-[#20b2aa]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <UserPlus size={18} />
              Criar Perfil
            </button>
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${!isSignUp ? 'border-[#20b2aa] text-[#20b2aa]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <LogIn size={18} />
              Já tenho conta
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Campos exclusivos do Cadastro */}
            {isSignUp && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#20b2aa] focus:outline-none focus:ring-[#20b2aa] sm:text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Unidade de Saúde</label>
                  <select
                    required
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-[#20b2aa] focus:outline-none focus:ring-[#20b2aa] sm:text-sm bg-white"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  >
                    <option value="" disabled>Selecione seu local principal...</option>
                    {hospitaisSaoLuis.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno Principal</label>
                  <select
                    required
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-[#20b2aa] focus:outline-none focus:ring-[#20b2aa] sm:text-sm bg-white"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                  >
                    <option value="" disabled>Selecione o turno...</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Misto/Rodízio">Misto / Rodízio</option>
                  </select>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    id="plantao"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#20b2aa] focus:ring-[#20b2aa]"
                    checked={hasOnCall}
                    onChange={(e) => setHasOnCall(e.target.checked)}
                  />
                  <label htmlFor="plantao" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Atualmente realizo plantões extras (12h, 24h, etc)
                  </label>
                </div>
                
                <hr className="border-gray-200" />
              </div>
            )}

            {/* Campos de Conta (Comuns para Cadastro e Login) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#20b2aa] focus:outline-none focus:ring-[#20b2aa] sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#20b2aa] focus:outline-none focus:ring-[#20b2aa] sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-[#20b2aa] py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#1a9089] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20b2aa] transition-colors disabled:opacity-70 mt-6"
            >
              {isLoading ? 'Aguarde...' : (isSignUp ? 'Salvar Perfil e Criar Conta' : 'Entrar')}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}