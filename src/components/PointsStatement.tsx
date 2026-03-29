import { Award, TrendingUp, Gift } from 'lucide-react';

export const PointsStatement = ({ entries }: { entries: any[] }) => {
  // 50 pontos por check-in para incentivar a assiduidade
  const totalPoints = (entries?.length || 0) * 50; 
  const nextGoal = 1000;
  const progress = (totalPoints / nextGoal) * 100;

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#20b2aa]/10 flex items-center justify-center">
            <Award className="text-[#20b2aa]" size={20} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 leading-none">Extrato de Pontos</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Programa de Reconhecimento</p>
          </div>
        </div>
        <span className="text-[10px] font-black text-white bg-[#20b2aa] px-3 py-1.5 rounded-full shadow-md shadow-[#20b2aa]/20">
          NÍVEL BRONZE
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
          <span className="text-gray-400">Progresso para Bonificação</span>
          <span className="text-[#20b2aa]">{totalPoints} / {nextGoal} PTS</span>
        </div>
        <div className="w-full h-4 bg-gray-50 rounded-full border border-gray-100 overflow-hidden p-1">
          <div 
            className="h-full bg-[#20b2aa] rounded-full transition-all duration-1000 shadow-sm" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#f8fafb] p-4 rounded-2xl flex items-center gap-3">
          <TrendingUp className="text-green-500" size={18} />
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Status</p>
            <p className="text-sm font-black text-gray-800">Ativo</p>
          </div>
        </div>
        <div className="bg-[#f8fafb] p-4 rounded-2xl flex items-center gap-3">
          <Gift className="text-orange-500" size={18} />
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Prêmios</p>
            <p className="text-sm font-black text-gray-800">Disponíveis</p>
          </div>
        </div>
      </div>
    </div>
  );
};