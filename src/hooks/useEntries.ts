import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DailyEntry, calculateBurnoutScore, classifyRisk } from '@/lib/burnout';

export function useEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (!error && data) {
      setEntries(data.map(d => ({
        ...d,
        risk_level: d.risk_level as 'low' | 'moderate' | 'high',
      })));
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (data: { fatigue: number; stress: number; sleepQuality: number }) => {
    if (!user) return null;
    setIsLoading(true);
    const score = calculateBurnoutScore(data.fatigue, data.stress, data.sleepQuality);
    const riskLevel = classifyRisk(score);
    const today = new Date().toISOString().split('T')[0];

    const { data: result, error } = await supabase
      .from('daily_entries')
      .upsert({
        user_id: user.id,
        date: today,
        fatigue: data.fatigue,
        stress: data.stress,
        sleep_quality: data.sleepQuality,
        score,
        risk_level: riskLevel,
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (!error && result) {
      await fetchEntries();
      setIsLoading(false);
      return {
        ...result,
        risk_level: result.risk_level as 'low' | 'moderate' | 'high',
      } as DailyEntry;
    }
    setIsLoading(false);
    return null;
  }, [user, fetchEntries]);

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : undefined;

  return { entries, latestEntry, addEntry, isLoading };
}
