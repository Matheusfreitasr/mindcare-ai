import { useState, useEffect, useCallback } from 'react';
import { DailyEntry, calculateBurnoutScore, classifyRisk } from '@/lib/burnout';

// Local storage hook for now - will be replaced with Supabase
const STORAGE_KEY = 'mindcare-entries';

export function useEntries() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const saveEntries = useCallback((newEntries: DailyEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  }, []);

  const addEntry = useCallback((data: { fatigue: number; stress: number; sleepQuality: number }) => {
    setIsLoading(true);
    const score = calculateBurnoutScore(data.fatigue, data.stress, data.sleepQuality);
    const entry: DailyEntry = {
      id: crypto.randomUUID(),
      user_id: 'local',
      date: new Date().toISOString().split('T')[0],
      fatigue: data.fatigue,
      stress: data.stress,
      sleep_quality: data.sleepQuality,
      score,
      risk_level: classifyRisk(score),
      created_at: new Date().toISOString(),
    };

    // Replace if same date exists
    const filtered = entries.filter(e => e.date !== entry.date);
    const newEntries = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
    saveEntries(newEntries);
    setIsLoading(false);
    return entry;
  }, [entries, saveEntries]);

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : undefined;

  return { entries, latestEntry, addEntry, isLoading };
}
