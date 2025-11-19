import type { TaskableConfig } from '@/src/types';

const CONFIG_KEY = 'taskable_config';

export const configStorage = {
  get(): TaskableConfig | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  set(config: TaskableConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONFIG_KEY);
  },
};

