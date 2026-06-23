import { describe, expect, it, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

const initialState = {
  accessToken: null,
  user: null,
  role: null,
  isBootstrapping: true,
};

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState(initialState);
  });

  it("stores and clears session data", () => {
    useAuthStore.getState().setSession({
      accessToken: "access-1",
      user: { id: 1, email: "user@example.com", role: "SELLER" },
    });

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: "access-1",
      role: "SELLER",
      user: { email: "user@example.com" },
    });

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      role: null,
      user: null,
    });
  });

  it("updates bootstrapping and access token independently", () => {
    useAuthStore.getState().setBootstrapped();
    useAuthStore.getState().updateTokens({ accessToken: "access-2" });

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: "access-2",
      isBootstrapping: false,
    });
  });
});
