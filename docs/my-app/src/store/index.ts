import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: true, // Default to dark mode per design docs
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  user: null,
  setUser: (user) => set({ user }),
}));
