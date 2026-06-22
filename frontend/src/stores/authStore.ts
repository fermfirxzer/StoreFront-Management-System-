import { create } from "zustand";

type Role = "SELLER" | "BUYER";

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setSession: ({ accessToken, refreshToken, user }) =>
    set({ accessToken, refreshToken, user }),
  clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
}));

