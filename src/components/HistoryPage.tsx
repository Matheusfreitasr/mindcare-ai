import { Calendar, MapPin, ChevronRight } from 'lucide-react';

export const HistoryPage = ({ entries }: { entries: any[] }) => {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-gray-900">Histórico de Plantões</h3>
        <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase">
          {entries.length} Registros
        </span>
      </div>

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div 
            key={idx} 
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">
                  {new Date(entry.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                </span>
                <span className="text-lg font-black text-gray-700 leading-none">
                  {new Date(entry.date).getDate()}
                </span>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <MapPin size={12} className="text-primary" />
                  <h4 className="text-sm font-bold text-gray-800">
                    {(entry as any).hospital_ref || 'Local não informado'}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                     entry.risk_level === 'high' ? 'bg-red-50 text-red-500' : 
                     entry.risk_level === 'moderate' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'
                   }`}>
                     Risco {entry.risk_level === 'low' ? 'Baixo' : entry.risk_level === 'moderate' ? 'Moderado' : 'Alto'}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="block text-2xl font-black text-gray-900 leading-none">{entry.score}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Score IA</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};