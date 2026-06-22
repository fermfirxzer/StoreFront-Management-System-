import { create } from "zustand";
import type { AuthUser, UserRole } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;
  updateTokens: (payload: {
    accessToken: string;
    refreshToken?: string;
  }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  role: null,
  setSession: ({ accessToken, refreshToken, user }) =>
    set({ accessToken, refreshToken, user, role: user.role }),
  updateTokens: ({ accessToken, refreshToken }) =>
    set((state) => ({
      accessToken,
      refreshToken: refreshToken ?? state.refreshToken,
    })),
  clearSession: () =>
    set({ accessToken: null, refreshToken: null, user: null, role: null }),
}));

