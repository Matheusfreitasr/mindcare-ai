import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Filter, Target, CalendarDays, Building, FileText } from 'lucide-react';

const TIME_FILTERS = [
  { label: 'Hoje', days: 0 }, { label: '7 dias', days: 7 }, { label: '3 meses', days: 90 },
  { label: '6 meses', days: 180 }, { label: '12 meses', days: 365 }, { label: 'Ano Específico', isYear: true }
];

const RISK_FILTERS = ['Todos', 'Bom', 'Atenção', 'Ruim (Risco)'];

export function EvolutionTab({ profile, userEmail }: any) {
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [displayedEntries, setDisplayedEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedTime, setSelectedTime] = useState(TIME_FILTERS[0]); // Começa sempre no Hoje
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRisk, setSelectedRisk] = useState('Todos');
  const [selectedHospital, setSelectedHospital] = useState('Todas as Unidades');

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('daily_entries').select('*').eq('user_id', user.id).order('date', { ascending: true });
        
        const validData = (data as any[] || []).filter((e: any) => e.hospital_name !== 'FINALIZADO');
        setAllEntries(validData);
      } catch (error) {
        console.error(error);
      } finally { setLoading(false); }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    let filtered = [...allEntries];
    const todayLocal = new Date().toLocaleDateString('en-CA');

    if (selectedTime.isYear) {
      filtered = filtered.filter(e => new Date(e.date).getFullYear() === selectedYear);
    } else if (selectedTime.days === 0) {
      filtered = filtered.filter((e: any) => new Date(e.date).toLocaleDateString('en-CA') === todayLocal);
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - selectedTime.days);
      cutoffDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(e => new Date(e.date) >= cutoffDate);
    }

    if (selectedRisk !== 'Todos') {
      filtered = filtered.filter(e => {
         const s = Math.round(e.score);
         if (selectedRisk === 'Bom') return s > 60;
         if (selectedRisk === 'Atenção') return s > 40 && s <= 60;
         return s <= 40; 
      });
    }

    if (selectedHospital !== 'Todas as Unidades') {
      filtered = filtered.filter((e: any) => e.hospital_name === selectedHospital);
    }

    setDisplayedEntries(filtered.reverse()); // Recentes primeiro
  }, [allEntries, selectedTime, selectedYear, selectedRisk, selectedHospital]);

  const averageScore = displayedEntries.length > 0 ? Math.round(displayedEntries.reduce((sum:any, e:any) => sum + e.score, 0) / displayedEntries.length) : 0;
  const statusGeral = averageScore > 60 ? 'Bom / Estável' : (averageScore > 40 ? 'Atenção' : 'Crítico (Risco)');
  const availableYears = Array.from(new Set(allEntries.map(e => new Date(e.date).getFullYear()))).sort().reverse();
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear());
  const hospitalOptions = ['Todas as Unidades', ...(profile?.work_places?.map((w:any) => w.hospital) || [])];

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-700 print:hidden">
        
        {/* FILTROS COMPACTOS E MINIMALISTAS */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-gray-50 transition-all duration-300">
          <div className="flex items-center justify-between">
              <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                     <FileText size={16} className="text-[#20b2aa]"/> Relatórios
                  </h4>
                  <p className="text-[10px] font-bold text-[#20b2aa] uppercase tracking-widest mt-1">
                     {selectedHospital} • {selectedTime.isYear ? selectedYear : selectedTime.label}
                  </p>
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-xl transition-all ${showFilters ? 'bg-[#20b2aa] text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:text-[#20b2aa] hover:bg-[#20b2aa]/10'}`}>
                 <Filter size={16} />
              </button>
          </div>
          
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-gray-50 space-y-4 animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full w-fit border border-gray-100">
                  <div className="bg-white p-1.5 rounded-full text-[#20b2aa] shadow-sm"><Building size={12}/></div>
                  <select value={selectedHospital} onChange={e => setSelectedHospital(e.target.value)} className="bg-transparent font-black text-gray-700 text-[9px] uppercase pr-3 outline-none cursor-pointer">
                     {hospitalOptions.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
               </div>

               <div className="flex flex-wrap gap-2">
                 {TIME_FILTERS.map(f => (
                   <button key={f.label} onClick={() => setSelectedTime(f)} className={`px-4 py-2.5 rounded-full text-[9px] font-black uppercase transition-all shadow-sm ${selectedTime.label === f.label ? 'bg-[#20b2aa] text-white shadow-[#20b2aa]/30' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-[#20b2aa]/30'}`}>
                     {f.label}
                   </button>
                 ))}
                 {selectedTime.isYear && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 rounded-full border border-[#20b2aa]/30">
                       <CalendarDays size={12} className="text-[#20b2aa]" />
                       <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-transparent font-black text-gray-700 outline-none text-[9px] uppercase cursor-pointer py-2.5">
                          {availableYears.map(y => <option key={y} value={y}>Ano {y}</option>)}
                       </select>
                    </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* ÁREA DE RESULTADOS (SEM GRÁFICO) */}
        {loading ? (
            <div className="flex justify-center p-12 items-center"><Loader2 className="animate-spin text-[#20b2aa]" size={30}/></div>
        ) : displayedEntries.length === 0 ? (
            <div className="bg-white p-10 rounded-[2.5rem] text-center shadow-xl border border-gray-50 flex flex-col justify-center items-center">
               <Target size={30} className="mx-auto text-gray-200 mb-3" />
               <h3 className="text-xl font-black text-gray-400 tracking-tight">Sem registos no período.</h3>
            </div>
        ) : (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] text-center space-y-6 shadow-xl border border-gray-50 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-[1.25rem] flex items-center justify-center border border-emerald-100 mb-4"><FileText size={24}/></div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Relatório Pronto</h3>
                  <p className="text-xs font-medium text-gray-500 max-w-sm mx-auto leading-relaxed mt-2">
                      Foram encontrados <strong>{displayedEntries.length}</strong> registos para {selectedHospital} neste período.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 w-full mt-6 mb-6 text-left">
                     <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Score Médio</p>
                        <p className="text-xl font-black text-[#20b2aa]">{averageScore}%</p>
                     </div>
                     <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status Geral</p>
                        <p className={`text-sm font-black uppercase mt-1 ${averageScore > 60 ? 'text-emerald-500' : 'text-red-500'}`}>{statusGeral}</p>
                     </div>
                  </div>

                  <button onClick={() => window.print()} className="w-full bg-[#20b2aa] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Download size={16}/> Imprimir PDF Completo
                  </button>
              </div>
          </div>
        )}
      </div>

      {/* PDF NATIVO COM COLUNA DE OBSERVAÇÕES E HOSPITAL */}
      <div className="hidden print:block print:absolute print:inset-0 print:bg-white print:z-[99999] print:p-8 text-black">
         <div className="flex justify-between items-end border-b-2 border-gray-200 pb-6 mb-8">
            <div>
               <h1 className="text-3xl font-black text-[#20b2aa] tracking-tighter">MindCare</h1>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Acompanhamento de Burnout</p>
            </div>
            <div className="text-right">
               <h2 className="text-lg font-black text-gray-900">{profile?.display_name || 'Profissional de Saúde'}</h2>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{selectedHospital}</p>
            </div>
         </div>
         <div className="mb-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Resumo do Período: {selectedTime.isYear ? selectedYear : selectedTime.label}</h3>
            <div className="grid grid-cols-3 gap-4">
               <div className="p-3 bg-gray-50 rounded-xl border border-gray-100"><p className="text-[9px] font-bold text-gray-500 uppercase">Registos</p><p className="text-xl font-black text-[#20b2aa]">{displayedEntries.length}</p></div>
               <div className="p-3 bg-gray-50 rounded-xl border border-gray-100"><p className="text-[9px] font-bold text-gray-500 uppercase">Score Médio</p><p className="text-xl font-black text-[#20b2aa]">{averageScore}%</p></div>
               <div className="p-3 bg-gray-50 rounded-xl border border-gray-100"><p className="text-[9px] font-bold text-gray-500 uppercase">Estado Geral</p><p className={`text-xl font-black ${averageScore > 60 ? 'text-emerald-500' : 'text-red-500'}`}>{statusGeral}</p></div>
            </div>
         </div>
         
         <div>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b-2 border-gray-200">
                     <th className="py-2 text-[10px] font-black text-gray-500 uppercase">Data</th>
                     {selectedHospital === 'Todas as Unidades' && <th className="py-2 text-[10px] font-black text-gray-500 uppercase">Unidade</th>}
                     <th className="py-2 text-[10px] font-black text-gray-500 uppercase">Score</th>
                     <th className="py-2 text-[10px] font-black text-gray-500 uppercase w-1/3">Observações do Turno</th>
                  </tr>
               </thead>
               <tbody>
                  {displayedEntries.map((e:any, i:number) => {
                     const sc = Math.round(e.score);
                     return (
                     <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 text-xs font-bold text-gray-800">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                        {selectedHospital === 'Todas as Unidades' && <td className="py-3 text-xs font-bold text-gray-600">{e.hospital_name || 'Geral'}</td>}
                        <td className="py-3 text-xs font-black text-[#20b2aa]">{sc}%</td>
                        <td className="py-3 text-[10px] font-medium text-gray-500 italic pr-2">{e.notes || '-'}</td>
                     </tr>
                  )})}
               </tbody>
            </table>
         </div>
      </div>
    </>
  );
}