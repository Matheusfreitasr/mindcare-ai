import { Card } from '@/components/ui/card';
import { DailyEntry } from '@/lib/burnout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ScoreChartProps {
  entries: DailyEntry[];
}

export function ScoreChart({ entries }: ScoreChartProps) {
  if (entries.length < 2) {
    return (
      <Card className="glass-card p-5 text-center animate-slide-up">
        <p className="text-muted-foreground text-sm">
          Registre pelo menos 2 check-ins para ver o gráfico de evolução
        </p>
      </Card>
    );
  }

  const chartData = entries.slice(-30).map(e => ({
    date: format(parseISO(e.date), 'dd/MM', { locale: ptBR }),
    score: e.score,
    fatigue: e.fatigue,
    stress: e.stress,
    sleep: e.sleep_quality,
  }));

  return (
    <Card className="glass-card p-5 animate-slide-up">
      <h3 className="font-heading font-bold text-lg mb-4">Evolução do Score</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 62%, 38%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(174, 62%, 38%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 89%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(200, 10%, 45%)" />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(200, 10%, 45%)" />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid hsl(200, 15%, 89%)',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(174, 62%, 38%)"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              name="Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
