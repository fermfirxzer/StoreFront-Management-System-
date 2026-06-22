export type UserRole = "SELLER" | "BUYER";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  passwordConfirmation: string;
  role: UserRole;
}

