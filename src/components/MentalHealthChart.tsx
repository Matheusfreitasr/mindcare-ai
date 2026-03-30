import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MentalHealthChartProps {
  entries: any[];
}

export function MentalHealthChart({ entries }: MentalHealthChartProps) {
  // FORMATA DADOS PARA O RECHARTS
  const data = entries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    score: Math.round(entry.score),
    risk: entry.risk_level
  }));

  // Auxiliar para Tooltip Personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { score, risk, date } = payload[0].payload;
      return (
        <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 space-y-2 animate-in fade-in duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Check-in: {date}</p>
          <div className="flex items-center gap-2">
             <ReferenceLine y={score} stroke={risk === 'alto' ? '#ef4444' : '#20b2aa'} strokeWidth={2}/>
             <p className={`text-4xl font-black ${risk === 'alto' ? 'text-red-500' : 'text-[#20b2aa]'}`}>{score}%</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase inline-flex gap-1 items-center ${risk === 'alto' ? 'bg-red-50 text-red-500' : 'bg-[#20b2aa]/5 text-[#20b2aa]'}`}>
             {risk === 'alto' ? 'Risco Alto Detectado (Atenção)' : 'Score Mental Estável'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] p-8 animate-in fade-in duration-1000 font-sans">
      <div className="text-center mb-6">
           <p className="text-[10px] font-black text-[#20b2aa] uppercase tracking-[0.4em] mb-1">Evolução Mental IA</p>
           <h4 className="text-3xl font-black tracking-tighterleading-tight text-gray-950">Gráfico do Período</h4>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={3} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 9, fontStyle: 'normal', fill: '#999', fontWeight: 700 }} 
          />
          <YAxis 
            hide={true} 
            domain={[0, 100]} 
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          
          <ReferenceLine y={50} stroke="#eee" strokeWidth={1} strokeDasharray="5 5"/>
          
          <Bar 
            dataKey="score" 
            radius={[8, 8, 0, 0]}
            fill="#20b2aa"
            fillOpacity={0.7}
            activeBar={{ fill: '#20b2aa', fillOpacity: 1 }}
          >
             {/* COLORE A BARRA DE ACORDO COM O RISCO */}
             {data.map((entry, index) => (
                <ReferenceLine key={index} y={entry.score} stroke={entry.risk === 'alto' ? '#ef4444' : '#20b2aa'} strokeWidth={0}/>
             ))}
             {data.map((entry, index) => (
                <ReferenceLine key={index} y={entry.score} stroke={entry.risk === 'alto' ? '#ef4444' : '#20b2aa'} strokeWidth={0}/>
             ))}
             {data.map((entry, index) => (
                <ReferenceLine key={index} y={entry.score} stroke={entry.risk === 'alto' ? '#ef4444' : '#20b2aa'} strokeWidth={0}/>
             ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}