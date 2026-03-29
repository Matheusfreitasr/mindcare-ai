import { Card } from '@/components/ui/card';
import { DailyEntry, getRiskLabel, getWeeklyAverage } from '@/lib/burnout';
import { format, parseISO, subDays, subMonths, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface HistoryPageProps {
  entries: DailyEntry[];
}

export function HistoryPage({ entries }: HistoryPageProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  const todayEntry = entries.find(e => e.date === todayStr);
  const yesterdayEntry = entries.find(e => e.date === yesterdayStr);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekEntries = entries.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  const monthStart = subMonths(today, 1);
  const monthEntries = entries.filter(e => parseISO(e.date) >= monthStart);

  const weekAvg = weekEntries.length > 0
    ? Math.round((weekEntries.reduce((s, e) => s + e.score, 0) / weekEntries.length) * 10) / 10
    : null;

  const monthAvg = monthEntries.length > 0
    ? Math.round((monthEntries.reduce((s, e) => s + e.score, 0) / monthEntries.length) * 10) / 10
    : null;

  const getDiffIcon = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null;
    const diff = current - previous;
    if (diff > 0.3) return <ArrowUp size={14} className="text-danger" />;
    if (diff < -0.3) return <ArrowDown size={14} className="text-success" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Comparisons */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Ontem</p>
          <p className="text-xl font-heading font-bold">
            {yesterdayEntry ? yesterdayEntry.score : '–'}
          </p>
          {yesterdayEntry && todayEntry && (
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {getDiffIcon(todayEntry.score, yesterdayEntry.score)}
            </div>
          )}
        </Card>
        <Card className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Semana</p>
          <p className="text-xl font-heading font-bold">{weekAvg ?? '–'}</p>
          <p className="text-xs text-muted-foreground">{weekEntries.length} reg.</p>
        </Card>
        <Card className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Mês</p>
          <p className="text-xl font-heading font-bold">{monthAvg ?? '–'}</p>
          <p className="text-xs text-muted-foreground">{monthEntries.length} reg.</p>
        </Card>
      </div>

      {/* Entries list */}
      <Card className="glass-card p-4">
        <h3 className="font-heading font-bold text-lg mb-3">Histórico de Check-ins</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum registro ainda</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[...entries].reverse().map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-sm">
                    {format(parseISO(entry.date), "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-semibold">{entry.score}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium risk-${entry.risk_level}`}>
                    {getRiskLabel(entry.risk_level)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
