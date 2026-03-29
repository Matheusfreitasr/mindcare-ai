import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter } from 'lucide-react';

export const ScoreChart = ({ entries }: { entries: any[] }) => {
  const [selectedHospital, setSelectedHospital] = useState('Todos');

  // Identifica todos os hospitais que já tiveram registros no sistema
  const hospitals = useMemo(() => {
    const list = entries.map(e => (e as any).hospital_ref).filter(Boolean);
    return ['Todos', ...Array.from(new Set(list))];
  }, [entries]);

  // Filtra e ordena os dados cronologicamente para o gráfico não quebrar
  const chartData = useMemo(() => {
    let filtered = selectedHospital === 'Todos' 
      ? entries 
      : entries.filter(e => (e as any).hospital_ref === selectedHospital);

    return filtered.map(e => ({
      ...e,
      // Formata a data para exibir no eixo X
      formattedDate: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, selectedHospital]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Evolução do Risco</h3>
          <p className="text-xs text-gray-400 font-medium italic">Análise de Burnout por unidade hospitalar</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 w-full sm:w-auto">
          <Filter size={14} className="text-primary" />
          <select 
            value={selectedHospital} 
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="bg-transparent text-xs font-bold text-gray-600 outline-none flex-1"
          >
            {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#20b2aa" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#20b2aa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{fontSize: 10, fontWeight: 600, fill: '#999'}} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis domain={[0, 10]} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#333' }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#20b2aa" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorScore)" 
              name="Score IA"
              dot={{ r: 4, fill: '#20b2aa', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-center text-gray-400 font-medium">Os dados refletem o histórico individual de cada plantão registrado.</p>
    </div>
  );
};