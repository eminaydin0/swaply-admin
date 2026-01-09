import { create } from 'zustand';
import type { ThemePreference } from '../types/models';

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'theme_preference';

function readTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function writeTheme(theme: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    writeTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next: ThemePreference = get().theme === 'dark' ? 'light' : 'dark';
    writeTheme(next);
    set({ theme: next });
  },
}));
