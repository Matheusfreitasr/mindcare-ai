import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Filter, Target, CalendarDays } from 'lucide-react';
import { ScoreChart } from '@/components/ScoreChart';

const TIME_FILTERS = [
  { label: 'Hoje', days: 0 }, { label: '7 dias', days: 7 }, { label: '3 meses', days: 90 },
  { label: '6 meses', days: 180 }, { label: '12 meses', days: 365 }, { label: 'Ano Específico', isYear: true }
];

const RISK_FILTERS = ['Todos', 'Bom', 'Atenção', 'Ruim (Risco)'];

export function EvolutionTab({ profile, userEmail }: any) {
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [displayedEntries, setDisplayedEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTime, setSelectedTime] = useState(TIME_FILTERS[1]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRisk, setSelectedRisk] = useState('Todos');

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('daily_entries').select('*').eq('user_id', user.id).order('date', { ascending: true });
        setAllEntries(data || []);
      } catch (error) {
        console.error(error);
      } finally { setLoading(false); }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    let filtered = [...allEntries];
    const today = new Date();

    // FILTRO DE TEMPO CORRIGIDO (Matemática Absoluta)
    if (selectedTime.isYear) {
      filtered = filtered.filter(e => new Date(e.date).getFullYear() === selectedYear);
    } else if (selectedTime.days === 0) {
      // HOJE: Funciona sempre independentemente do fuso
      filtered = filtered.filter(e => {
          const d = new Date(e.date);
          return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      });
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - selectedTime.days);
      cutoffDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(e => new Date(e.date) >= cutoffDate);
    }

    // Filtro Risco
    if (selectedRisk !== 'Todos') {
      filtered = filtered.filter(e => {
         const s = Math.round(e.score);
         if (selectedRisk === 'Bom') return s > 60;
         if (selectedRisk === 'Atenção') return s > 40 && s <= 60;
         return s <= 40; 
      });
    }

    setDisplayedEntries(filtered);
  }, [allEntries, selectedTime, selectedYear, selectedRisk]);

  const averageScore = displayedEntries.length > 0 ? Math.round(displayedEntries.reduce((sum:any, e:any) => sum + e.score, 0) / displayedEntries.length) : 0;
  const statusIA = averageScore > 60 ? 'Bom / Estável' : (averageScore > 40 ? 'Atenção' : 'Crítico (Risco)');
  const availableYears = Array.from(new Set(allEntries.map(e => new Date(e.date).getFullYear()))).sort().reverse();
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear());

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700 print:hidden">
        <div className="bg-white p-6 md:p-8 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-6">
          <div className="flex items-center gap-2 ml-2"><Filter size={16} className="text-[#20b2aa]" /><h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtros de Análise IA</h4></div>
          <div className="space-y-5">
             <div className="flex flex-wrap gap-2.5">
               {TIME_FILTERS.map(f => (
                 <button key={f.label} onClick={() => setSelectedTime(f)} className={`px-5 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${selectedTime.label === f.label ? 'bg-[#20b2aa] text-white shadow-[#20b2aa]/30' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-[#20b2aa]/30'}`}>
                   {f.label}
                 </button>
               ))}
               {selectedTime.isYear && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 rounded-full border border-[#20b2aa]/30">
                     <CalendarDays size={14} className="text-[#20b2aa]" />
                     <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-transparent font-black text-gray-700 outline-none text-[10px] uppercase cursor-pointer py-3">
                        {availableYears.map(y => <option key={y} value={y}>Ver Ano {y}</option>)}
                     </select>
                  </div>
               )}
             </div>
             <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase mr-2">Estado:</span>
               {RISK_FILTERS.map(r => (
                 <button key={r} onClick={() => setSelectedRisk(r)} className={`px-5 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${selectedRisk === r ? 'bg-[#20b2aa] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                   {r}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center p-20 min-h-[300px] items-center"><Loader2 className="animate-spin text-[#20b2aa]" size={40}/></div>
        ) : displayedEntries.length === 0 ? (
            <div className="bg-white p-12 rounded-[4rem] text-center shadow-xl border border-gray-50 min-h-[300px] flex flex-col justify-center items-center">
               <Target size={40} className="mx-auto text-gray-200 mb-4" />
               <h3 className="text-2xl font-black text-gray-400 tracking-tight">Nenhum registo encontrado para os filtros.</h3>
            </div>
        ) : (
          <>
            <div className="bg-white p-2 md:p-4 rounded-[4rem] shadow-2xl border border-gray-50/50">
              <ScoreChart entries={displayedEntries} />
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 p-10 md:p-12 rounded-[4rem] text-center space-y-6 shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Gerar Documento PDF</h3>
                    <p className="text-xs font-medium text-gray-500 max-w-sm mx-auto leading-relaxed mt-2">
                        O relatório trará o seu nome, locais de trabalho e a análise do período exato que filtrou.
                    </p>
                    <div className="flex justify-center pt-6">
                        <button onClick={() => window.print()} className="bg-[#20b2aa] text-white px-10 py-5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all hover:shadow-[#20b2aa]/40">
                            <Download size={18}/> Guardar PDF Oficial
                        </button>
                    </div>
                </div>
            </div>
          </>
        )}
      </div>

      <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-[99999] print:p-10 text-black">
         <div className="flex justify-between items-end border-b-2 border-gray-200 pb-6 mb-8">
            <div>
               <h1 className="text-4xl font-black text-[#20b2aa] tracking-tighter">MindCare IA</h1>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Gestão de Saúde Mental</p>
            </div>
            <div className="text-right">
               <h2 className="text-xl font-black text-gray-900">{profile?.display_name || 'Profissional de Saúde'}</h2>
            </div>
         </div>
         <div className="mb-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Resumo da Avaliação: {selectedTime.isYear ? selectedYear : selectedTime.label} {selectedRisk !== 'Todos' && `(Estado: ${selectedRisk})`}</h3>
            <div className="grid grid-cols-3 gap-4">
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase">Check-ins Feitos</p><p className="text-2xl font-black text-[#20b2aa]">{displayedEntries.length}</p></div>
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase">Score Médio</p><p className="text-2xl font-black text-[#20b2aa]">{averageScore}%</p></div>
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase">Estado Geral</p><p className={`text-2xl font-black ${averageScore > 60 ? 'text-emerald-500' : 'text-red-500'}`}>{statusIA}</p></div>
            </div>
         </div>
         <div className="mb-8">
             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Locais de Trabalho Cadastrados</h3>
             {profile?.work_places?.length > 0 ? profile.work_places.map((wp:any, i:number) => (
                 <p key={i} className="text-sm font-bold text-gray-700 mb-1">• {wp.hospital} - {wp.shift} {wp.isOnCall ? '(Plantonista)' : ''}</p>
             )) : <p className="text-sm italic text-gray-500">Nenhum local cadastrado.</p>}
         </div>
         <div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Histórico Filtrado</h3>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-200">
                     <th className="py-3 text-xs font-black text-gray-500 uppercase">Data</th>
                     <th className="py-3 text-xs font-black text-gray-500 uppercase">Score IA</th>
                     <th className="py-3 text-xs font-black text-gray-500 uppercase">Nível de Risco</th>
                  </tr>
               </thead>
               <tbody>
                  {displayedEntries.map((e:any, i:number) => {
                     const sc = Math.round(e.score);
                     const rsk = sc > 60 ? 'Bom' : (sc > 40 ? 'Atenção' : 'Ruim (Risco)');
                     return (
                     <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 text-sm font-bold text-gray-800">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 text-sm font-black text-[#20b2aa]">{sc}%</td>
                        <td className="py-3 text-xs font-bold uppercase text-gray-500">{rsk}</td>
                     </tr>
                  )})}
               </tbody>
            </table>
         </div>
      </div>
    </>
  );
}