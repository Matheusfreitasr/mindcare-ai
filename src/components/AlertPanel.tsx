import { Card } from '@/components/ui/card';
import { getRecommendations } from '@/lib/burnout';
import { AlertTriangle, Lightbulb } from 'lucide-react';

interface AlertPanelProps {
  riskLevel: 'low' | 'moderate' | 'high';
}

export function AlertPanel({ riskLevel }: AlertPanelProps) {
  const recommendations = getRecommendations(riskLevel);

  if (riskLevel === 'low') return null;

  return (
    <Card className={`p-4 border-2 animate-slide-up ${riskLevel === 'high' ? 'risk-high animate-pulse-glow' : 'risk-moderate'}`}>
      <div className="flex items-center gap-2 mb-3">
        {riskLevel === 'high' ? (
          <AlertTriangle className="text-danger" size={20} />
        ) : (
          <Lightbulb className="text-warning" size={20} />
        )}
        <h3 className="font-heading font-bold">
          {riskLevel === 'high' ? 'Alerta: Risco Elevado' : 'Atenção: Risco Moderado'}
        </h3>
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="text-sm flex items-start gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
