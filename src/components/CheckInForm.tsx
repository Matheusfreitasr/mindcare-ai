import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { calculateBurnoutScore, classifyRisk, getRiskLabel } from '@/lib/burnout';

interface CheckInFormProps {
  onSubmit: (data: { fatigue: number; stress: number; sleepQuality: number }) => void;
  isLoading?: boolean;
}

export function CheckInForm({ onSubmit, isLoading }: CheckInFormProps) {
  const [fatigue, setFatigue] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);

  const previewScore = calculateBurnoutScore(fatigue, stress, sleepQuality);
  const previewRisk = classifyRisk(previewScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ fatigue, stress, sleepQuality });
  };

  const sliderClass = "mt-2";

  return (
    <Card className="glass-card p-5 animate-slide-up">
      <h3 className="font-heading font-bold text-lg mb-4">Check-in Diário</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Nível de Cansaço</span>
            <span className="font-semibold">{fatigue}/10</span>
          </div>
          <Slider
            className={sliderClass}
            value={[fatigue]}
            onValueChange={([v]) => setFatigue(v)}
            min={0} max={10} step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Descansado</span><span>Exausto</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Nível de Estresse</span>
            <span className="font-semibold">{stress}/10</span>
          </div>
          <Slider
            className={sliderClass}
            value={[stress]}
            onValueChange={([v]) => setStress(v)}
            min={0} max={10} step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Tranquilo</span><span>Muito estressado</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Qualidade do Sono</span>
            <span className="font-semibold">{sleepQuality}/10</span>
          </div>
          <Slider
            className={sliderClass}
            value={[sleepQuality]}
            onValueChange={([v]) => setSleepQuality(v)}
            min={0} max={10} step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Péssimo</span><span>Excelente</span>
          </div>
        </div>

        <div className={`rounded-lg p-3 border text-center risk-${previewRisk}`}>
          <p className="text-xs uppercase tracking-wide font-semibold">Score Previsto</p>
          <p className="text-2xl font-heading font-bold">{previewScore}</p>
          <p className="text-sm font-medium">{getRiskLabel(previewRisk)}</p>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Registrar Check-in'}
        </Button>
      </form>
    </Card>
  );
}
