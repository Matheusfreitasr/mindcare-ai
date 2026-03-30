import { AreaChart, Area, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, XAxis } from 'recharts';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export function ScoreChart({ entries }: { entries: any[] }) {
  
  // SISTEMA DE CURA: Agrupa múltiplos check-ins do mesmo dia e faz a MÉDIA
  const groupedData: Record<string, { data: string; score: number; count: number }> = {};
  
  [...entries].reverse().forEach(entry => {
      const d = new Date(entry.date);
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!groupedData[dateStr]) {
          groupedData[dateStr] = { data: dateStr, score: entry.score, count: 1 };
      } else {
          groupedData[dateStr].score += entry.score;
          groupedData[dateStr].count += 1;
      }
  });
  
  // Calcula a média exata e arredonda para formar a linha reta
  const chartData = Object.values(groupedData).map((item) => ({
      data: item.data,
      score: Math.round(item.score / item.count)
  })).slice(-14);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-8 m-2">
        <AlertCircle className="text-gray-200 mb-4" size={48} />
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-center">Sem dados no período.</p>
      </div>
    );
  }

  const averageScore = Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length);
  const statusIA = averageScore > 60 ? 'Estável / Bom' : (averageScore > 40 ? 'Atenção' : 'Crítico (Risco)');

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Análise Mental</h3>
          <div className="flex items-center gap-2 mt-2"><Calendar size={14} className="text-[#20b2aa]" /><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Período Selecionado</p></div>
        </div>
        <div className="bg-[#20b2aa]/10 p-4 rounded-3xl border border-[#20b2aa]/20"><TrendingUp className="text-[#20b2aa]" size={24} /></div>
      </div>

      <div className="bg-white p-4 rounded-[3.5rem] shadow-inner border border-gray-50 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#20b2aa" stopOpacity={0.3}/><stop offset="95%" stopColor="#20b2aa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px' }} />
            <Area type="monotone" dataKey="score" stroke="#20b2aa" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Score Médio</p>
          <p className="text-2xl font-black text-[#20b2aa] leading-none">{averageScore} <span className="text-[10px]">pts</span></p>
        </div>
        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status IA</p>
          <p className={`text-lg font-black uppercase italic leading-none ${averageScore > 60 ? 'text-emerald-500' : 'text-red-500'}`}>{statusIA}</p>
        </div>
      </div>
    </div>
  );
}