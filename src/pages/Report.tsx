import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Loader2, Download, Filter, Target, Heart, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { MentalHealthChart } from '@/components/MentalHealthChart';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { MentalHealthReportPDF } from '@/components/MentalHealthReportPDF';

const TIME_RANGES = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Último Mês', days: 30 },
  { label: 'Últimos 3 Meses', days: 90 },
  { label: 'Últimos 6 Meses', days: 180 },
  { label: 'Último Ano', days: 365 }
];

export default function Report() {
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[0]);

  useEffect(() => {
    fetchData();
  }, [selectedRange]);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData }: any = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData || { hospitals: [] });

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - selectedRange.days);

      const { data: entriesData, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', cutoffDate.toISOString())
        .order('date', { ascending: true });
        
      if (error) throw error;
      setEntries(entriesData || []);
      
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
      toast.error("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  // CÁLCULOS ARREDONDADOS E SEGUROS
  const averageScore = entries.length > 0 
    ? Math.round(entries.reduce((sum, entry) => sum + (entry.score || 0), 0) / entries.length)
    : 0;
  
  const entriesWithRisk = entries.filter(e => e.risk_level === 'alto').length;
  const hospitalCount = profile?.hospitals?.length || 0;

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-24 font-sans relative overflow-hidden">
      
      {/* Decoração de Fundo */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#20b2aa]/5 rounded-full blur-[10rem] -translate-y-1/2 translate-x-1/3 z-0" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-50 relative overflow-hidden gap-4">
          <div className="absolute inset-0 bg-gradient-to-br from-[#20b2aa]/5 to-transparent opacity-50 z-0"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-gradient-to-tr from-[#20b2aa] to-[#a0f0ed] p-1 shadow-lg flex items-center justify-center border-4 border-white">
              <FileText className="w-8 h-8 md:w-12 md:h-12 brightness-0 invert" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tighter leading-tight">Evolução Mental</h1>
              <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={12} className="text-[#20b2aa]" /> Gestão de Burnout IA
              </p>
            </div>
          </div>
          <button className="p-4 bg-gray-50 rounded-full text-gray-400 hover:text-[#20b2aa] hover:bg-white active:scale-95 transition-all shadow-inner relative z-10">
              <Filter size={18} />
          </button>
        </div>

        {/* FILTROS DE TEMPO */}
        <div className="bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border border-gray-50">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-4">Período de Análise</h4>
          <div className="flex flex-wrap gap-2.5 p-3 bg-gray-50 rounded-[2rem] border border-gray-100">
            {TIME_RANGES.map(range => (
              <button 
                key={range.label} 
                onClick={() => setSelectedRange(range)} 
                className={`px-5 py-3 md:px-6 md:py-4 rounded-full text-[10px] md:text-[11px] font-extrabold uppercase transition-all duration-300 flex items-center gap-2 shadow-sm ${selectedRange.days === range.days ? 'bg-[#20b2aa] text-white shadow-lg shadow-[#20b2aa]/30' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#20b2aa]/20 hover:text-gray-600'}`}
              >
                 {selectedRange.days === range.days && <CheckCircle2 size={12}/>} {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="min-h-[300px] flex flex-col items-center justify-center p-20 animate-pulse text-[#20b2aa] space-y-3">
             <Loader2 className="animate-spin" size={40} />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando Dados IA...</p>
          </div>
        )}

        {/* SEM DADOS */}
        {!loading && entries.length === 0 && (
          <div className="min-h-[300px] flex flex-col items-center justify-center p-10 md:p-20 text-center space-y-6 bg-white rounded-[3.5rem] border border-gray-50 shadow-inner">
             <Target size={50} className="text-gray-200" />
             <h3 className="text-2xl md:text-3xl font-black text-gray-400 tracking-tighter">Sem registros no período.</h3>
             <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
               Faça seu check-in diário para gerar o gráfico de evolução.
             </p>
          </div>
        )}

        {/* COM DADOS */}
        {!loading && entries.length > 0 && (
          <div className="animate-in fade-in duration-1000 space-y-8">
            
            {/* CARDS DE RESUMO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-start">
              <SummaryCard label="Check-ins" value={`${entries.length}`} unit="Registros Ativos" />
              <SummaryCard label="Média Mental" value={`${averageScore}%`} unit="Score de Bem-estar" />
              <SummaryCard label="Risco Crítico" value={`${entriesWithRisk} Dias`} unit="Em Atenção (Alto)" />
              <SummaryCard label="Sua Rede" value={`${hospitalCount} Unid.`} unit="Hospitais SLZ" />
            </div>

            {/* GRÁFICO (Você precisa ter criado o componente MentalHealthChart.tsx antes) */}
            <div className="bg-white p-2 rounded-[3.5rem] md:rounded-[4rem] shadow-2xl border border-gray-50/50">
               <MentalHealthChart entries={entries} />
            </div>

            {/* DOWNLOAD PDF */}
            <div className="bg-gray-950 p-8 md:p-10 rounded-[3.5rem] md:rounded-[4rem] text-center space-y-6 shadow-2xl relative overflow-hidden">
                <Heart className="absolute bottom-10 right-10 text-red-400 animate-pulse" size={30} fill="currentColor" />
                
                <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Relatório em PDF</h3>
                <p className="text-xs md:text-sm font-medium text-gray-400 leading-relaxed max-w-lg mx-auto p-4 bg-white/5 rounded-2xl border border-white/10">
                    Gere o documento oficial com seus scores arredondados do período de <strong>{selectedRange.label}</strong>.
                </p>
                
                <div className="flex justify-center pt-2">
                  {/* IMPORTANTE: Aqui chamamos o gerador de PDF */}
                  <PDFDownloadLink 
                    document={<MentalHealthReportPDF profile={profile} entries={entries} range={selectedRange.label} />} 
                    fileName={`mindcare_${selectedRange.label.replace(/ /g, '_')}.pdf`}
                    className="bg-[#20b2aa] text-white px-8 py-5 md:px-10 md:py-6 rounded-full font-black flex items-center gap-3 active:scale-95 transition-all text-[10px] md:text-xs uppercase tracking-widest shadow-2xl hover:bg-[#1a9089]"
                  >
                    {({ loading: pdfLoading }) => (
                      pdfLoading ? <><Loader2 className="animate-spin" size={18}/> GERANDO PDF...</> : <><Download size={18}/> BAIXAR RELATÓRIO PDF</>
                    )}
                  </PDFDownloadLink>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// COMPONENTE AUXILIAR CORRIGIDO AQUI
function SummaryCard({ label, value, unit }: any) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-gray-50 flex flex-col items-center text-center space-y-2 shadow-xl shadow-gray-200/20">
      <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl md:text-3xl font-black text-gray-900 leading-none tracking-tight">{value}</p>
      <p className="text-[10px] md:text-[11px] font-bold text-gray-400">{unit}</p>
    </div>
  );
}