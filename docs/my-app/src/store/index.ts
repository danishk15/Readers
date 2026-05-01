import { create } from 'zustand';

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: any | null; // Will type properly when Supabase is added
  setUser: (user: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: true, // Default to dark mode per design docs
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  user: null,
  setUser: (user) => set({ user }),
}));
