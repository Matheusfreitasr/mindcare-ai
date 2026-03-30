import { useState } from 'react';
import { 
  Filter, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Search
} from 'lucide-react';

interface HistoryPageProps {
  entries: any[];
}

export function HistoryPage({ entries }: HistoryPageProps) {
  const [filter, setFilter] = useState('todos');

  const filteredEntries = entries.filter(entry => {
    if (filter === 'todos') return true;
    return entry.risk_level === filter;
  });

  const getRiskColor = (level: string) => {
    if (level === 'high') return 'text-red-500 bg-red-50 border-red-100';
    if (level === 'medium') return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-emerald-500 bg-emerald-50 border-emerald-100';
  };

  const getRiskIcon = (level: string) => {
    if (level === 'high') return <AlertTriangle size={14} />;
    if (level === 'medium') return <Clock size={14} />;
    return <CheckCircle2 size={14} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-6">
      {/* Header e Filtro Orgânico */}
      <div className="flex flex-col gap-6 px-2">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Histórico</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Registros de Bem-Estar</p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#20b2aa]">
            <Filter size={18} />
          </div>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'high', label: 'Alerta' },
            { id: 'medium', label: 'Atenção' },
            { id: 'low', label: 'Bom' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f.id 
                ? 'bg-[#20b2aa] text-white shadow-lg shadow-[#20b2aa]/20' 
                : 'bg-white text-gray-400 border border-gray-100 hover:border-[#20b2aa]/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Search className="mx-auto text-gray-300 mb-4" size={32} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nenhum registro encontrado</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div 
              key={entry.id} 
              className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl border ${getRiskColor(entry.risk_level)}`}>
                    {getRiskIcon(entry.risk_level)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-gray-900 leading-none">Score {entry.score}</span>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">pts</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-gray-300" />
                      <p className="text-[10px] font-bold text-gray-400">
                        {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-right">
                    <p className="text-[9px] font-black text-gray-300 uppercase">Cansaço</p>
                    <p className="text-xs font-black text-gray-700">{entry.fatigue}/10</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-200 group-hover:text-[#20b2aa] transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}