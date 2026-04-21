import { User } from "@/types/auth";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  setAuth: (user) => {
    set({ user });
  },

  clearAuth: () => {
    set({ user: null });
  },

  isAuthenticated: () => !!get().user,
}));
