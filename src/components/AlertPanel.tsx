import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AlertPanelProps {
  profile: any;
  entries: any[];
}

export function AlertPanel({ profile, entries }: AlertPanelProps) {
  // BLINDAGEM: Se o profile ou hospitals não existirem ainda, usamos uma lista vazia []
  const hospitals = profile?.hospitals || [];
  const hospitalCount = hospitals.length || 1;
  const lastEntry = entries && entries.length > 0 ? entries[0] : null;

  // Lógica de Risco IA
  const riskScore = lastEntry ? (lastEntry.fatigue * 0.8) + (hospitalCount * 1.2) : 0;
  const isHighRisk = riskScore > 10;

  return (
    <div className={`p-8 rounded-[3.5rem] border-2 transition-all duration-500 shadow-xl ${
      isHighRisk 
      ? 'bg-red-50 border-red-100 shadow-red-200/20' 
      : 'bg-emerald-50 border-emerald-100 shadow-emerald-200/20'
    }`}>
      <div className="flex items-start gap-6">
        <div className={`p-4 rounded-[1.5rem] shadow-lg ${isHighRisk ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {isHighRisk ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
        </div>
        
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.3em]">
              Análise de Risco MindCare IA
            </h4>
          </div>
          
          <p className="text-sm font-bold text-gray-700 leading-relaxed">
            {isHighRisk 
              ? `Atenção: Risco Crítico detectado devido à sobrecarga em ${hospitalCount} unidades de São Luís.` 
              : "Seu nível de bem-estar está estável. Continue monitorando sua rotina."}
          </p>

          {/* Exibição segura dos hospitais no alerta */}
          <div className="flex flex-wrap gap-2 mt-3">
            {hospitals.map((h: string) => (
              <span key={h} className="text-[8px] font-black uppercase px-2 py-1 bg-white/50 rounded-md text-gray-400">
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}