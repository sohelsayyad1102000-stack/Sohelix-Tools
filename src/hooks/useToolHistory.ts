import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface HistoryItem {
  id: string;
  name: string;
  slug: string;
  timestamp: number;
}

export function useToolHistory() {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('tool-history', []);

  const addToHistory = useCallback((tool: { id: string; name: string; slug: string }) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.id !== tool.id);
      const newItem = {
        ...tool,
        timestamp: Date.now()
      };
      return [newItem, ...filtered].slice(0, 10);
    });
  }, [setHistory]);

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  return { history, addToHistory, clearHistory };
}
