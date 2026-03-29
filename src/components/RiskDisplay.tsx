import { Card } from '@/components/ui/card';
import { DailyEntry, getRiskLabel, getRiskColor, analyzeTrend, getTrendLabel, getTrendMessage, getWeeklyAverage } from '@/lib/burnout';
import { TrendingUp, TrendingDown, Minus, Activity, Moon, Zap } from 'lucide-react';

interface RiskDisplayProps {
  entries: DailyEntry[];
  latestEntry?: DailyEntry;
}

export function RiskDisplay({ entries, latestEntry }: RiskDisplayProps) {
  if (!latestEntry) {
    return (
      <Card className="glass-card p-5 text-center animate-slide-up">
        <Activity className="mx-auto mb-2 text-muted-foreground" size={32} />
        <p className="text-muted-foreground">Faça seu primeiro check-in para ver seu score</p>
      </Card>
    );
  }

  const trend = analyzeTrend(entries);
  const weeklyAvg = getWeeklyAverage(entries);
  const riskColor = getRiskColor(latestEntry.risk_level);

  const TrendIcon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus;

  return (
    <div className="space-y-3 animate-slide-up">
      <Card className={`glass-card p-5 text-center border-2 border-${riskColor}/30`}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Score Atual</p>
        <p className={`text-5xl font-heading font-extrabold text-${riskColor}`}>
          {latestEntry.score}
        </p>
        <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold risk-${latestEntry.risk_level}`}>
          {getRiskLabel(latestEntry.risk_level)}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Card className="glass-card p-3 text-center">
          <Zap size={16} className="mx-auto mb-1 text-accent" />
          <p className="text-xs text-muted-foreground">Cansaço</p>
          <p className="font-bold">{latestEntry.fatigue}</p>
        </Card>
        <Card className="glass-card p-3 text-center">
          <Activity size={16} className="mx-auto mb-1 text-danger" />
          <p className="text-xs text-muted-foreground">Estresse</p>
          <p className="font-bold">{latestEntry.stress}</p>
        </Card>
        <Card className="glass-card p-3 text-center">
          <Moon size={16} className="mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Sono</p>
          <p className="font-bold">{latestEntry.sleep_quality}</p>
        </Card>
      </div>

      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Tendência (7 dias)</span>
          <div className="flex items-center gap-1">
            <TrendIcon size={16} className={trend === 'increasing' ? 'text-danger' : trend === 'decreasing' ? 'text-success' : 'text-muted-foreground'} />
            <span className="text-sm font-semibold">{getTrendLabel(trend)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Média Semanal</span>
          <span className="text-sm font-semibold">{weeklyAvg}</span>
        </div>
      </Card>

      {entries.length >= 3 && (
        <Card className={`p-4 border ${trend === 'increasing' ? 'risk-high' : trend === 'decreasing' ? 'risk-low' : 'risk-moderate'}`}>
          <p className="text-sm font-medium">{getTrendMessage(trend)}</p>
        </Card>
      )}
    </div>
  );
}
