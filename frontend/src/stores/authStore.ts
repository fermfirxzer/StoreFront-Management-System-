import { create } from "zustand";
import type { AuthUser, UserRole } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isBootstrapping: boolean;
  setSession: (payload: {
    accessToken: string;
    user: AuthUser;
  }) => void;
  setUser: (user: AuthUser) => void;
  setBootstrapped: () => void;
  updateTokens: (payload: {
    accessToken: string;
  }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  role: null,
  isBootstrapping: true,
  setSession: ({ accessToken, user }) => set({ accessToken, user, role: user.role }),
  setUser: (user) => set({ user, role: user.role }),
  setBootstrapped: () => set({ isBootstrapping: false }),
  updateTokens: ({ accessToken }) => set({ accessToken }),
  clearSession: () =>
    set({ accessToken: null, user: null, role: null }),
}));

