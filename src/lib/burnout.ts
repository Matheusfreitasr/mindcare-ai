export interface DailyEntry {
  id: string;
  user_id: string;
  date: string;
  fatigue: number;
  stress: number;
  sleep_quality: number;
  score: number;
  risk_level: 'low' | 'moderate' | 'high';
  created_at: string;
}

export const calculateBurnoutScore = (fatigue: number, stress: number, sleepQuality: number): number => {
  const burnoutRisk = (fatigue * 0.5) + (stress * 0.4) + ((10 - sleepQuality) * 0.1);
  return Math.max(1, Math.min(10, burnoutRisk)); // Retorna score entre 1 e 10
};
export const classifyRisk = (score: number): 'low' | 'moderate' | 'high' => {
  if (score <= 3.9) return 'low';
  if (score <= 6.9) return 'moderate';
  return 'high';
};

export const getRiskLabel = (risk: 'low' | 'moderate' | 'high'): string => {
  const labels = { low: 'Baixo Risco', moderate: 'Risco Moderado', high: 'Alto Risco' };
  return labels[risk];
}

export const getRiskColor = (risk: 'low' | 'moderate' | 'high'): string => {
  const colors = { low: 'success', moderate: 'warning', high: 'danger' };
  return colors[risk];
}

export const analyzeTrend = (entries: DailyEntry[]): 'increasing' | 'stable' | 'decreasing' => {
  if (entries.length < 3) return 'stable';
  const recent = entries.slice(-7);
  const mid = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, mid);
  const secondHalf = recent.slice(mid);
  const avgFirst = firstHalf.reduce((s, e) => s + e.score, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, e) => s + e.score, 0) / secondHalf.length;
  const diff = avgSecond - avgFirst;
  if (diff > 0.5) return 'increasing';
  if (diff < -0.5) return 'decreasing';
  return 'stable';
}

export const getTrendMessage = (trend: 'increasing' | 'stable' | 'decreasing'): string => {
  const messages = {
    increasing: '⚠️ Você apresenta tendência de aumento de risco de Burnout. Considere buscar apoio.',
    stable: '📊 Seus níveis de risco estão estáveis. Continue monitorando.',
    decreasing: '✅ Boa notícia! Seus níveis de risco estão diminuindo.',
  };
  return messages[trend];
}

export const getTrendLabel = (trend: 'increasing' | 'stable' | 'decreasing'): string => {
  return { increasing: 'Crescente', stable: 'Estável', decreasing: 'Decrescente' }[trend];
}

export const getRecommendations = (risk: 'low' | 'moderate' | 'high'): string[] => {
  const recs = {
    low: [
      'Continue mantendo bons hábitos de sono',
      'Pratique atividades de lazer regularmente',
      'Mantenha conexões sociais saudáveis',
    ],
    moderate: [
      'Considere técnicas de relaxamento como meditação',
      'Avalie sua carga de trabalho e estabeleça limites',
      'Priorize 7-8 horas de sono por noite',
      'Faça pausas regulares durante o turno',
    ],
    high: [
      '🚨 Procure apoio profissional (psicólogo/psiquiatra)',
      'Converse com sua chefia sobre a carga de trabalho',
      'Pratique exercícios de respiração diariamente',
      'Evite horas extras até recuperar seu bem-estar',
      'Considere tirar férias ou licença se possível',
    ],
  };
  return recs[risk];
}

export function getWeeklyAverage(entries: DailyEntry[]): number {
  if (!entries.length) return 0;
  const last7 = entries.slice(-7);
  return Math.round((last7.reduce((s, e) => s + e.score, 0) / last7.length) * 10) / 10;
}
