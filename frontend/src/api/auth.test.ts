import { describe, expect, it, vi, beforeEach } from "vitest";

describe("auth api", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("maps register payloads and returns auth sessions", async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          user: { id: 1, email: "seller@example.com", role: "SELLER" },
          tokens: { access: "access-1" },
        },
      },
    });
    const get = vi.fn().mockResolvedValue({
      data: {
        data: { id: 2, email: "me@example.com", role: "BUYER" },
      },
    });
    vi.doMock("./baseClient", () => ({
      createBaseClient: () => ({ post, get }),
    }));

    const { registerRequest, loginRequest, fetchMe, logoutRequest } = await import("./auth");
    const session = await registerRequest({
      email: "Seller@Example.com",
      password: "StrongPass123!",
      passwordConfirmation: "StrongPass123!",
      role: "SELLER",
    });

    expect(post).toHaveBeenCalledWith("/auth/register/", {
      email: "Seller@Example.com",
      password: "StrongPass123!",
      password_confirmation: "StrongPass123!",
      role: "SELLER",
    });
    expect(session.user.email).toBe("seller@example.com");

    const loginSession = await loginRequest({
      email: "buyer@example.com",
      password: "StrongPass123!",
    });
    expect(loginSession.tokens.access).toBe("access-1");

    expect(await fetchMe()).toEqual({
      id: 2,
      email: "me@example.com",
      role: "BUYER",
    });

    await logoutRequest();
    expect(post).toHaveBeenCalledWith("/auth/logout/");
  });

  it("deduplicates refresh requests while one is in flight", async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    const post = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    vi.doMock("./baseClient", () => ({
      createBaseClient: () => ({ post, get: vi.fn() }),
    }));

    const { refreshRequest } = await import("./auth");
    const first = refreshRequest();
    const second = refreshRequest();

    expect(post).toHaveBeenCalledTimes(1);

    resolveRequest({
      data: {
        data: {
          tokens: { access: "access-2" },
          user: { id: 9, email: "refresh@example.com", role: "BUYER" },
        },
      },
    });

    await expect(first).resolves.toEqual({
      tokens: { access: "access-2" },
      user: { id: 9, email: "refresh@example.com", role: "BUYER" },
    });
    await expect(second).resolves.toEqual({
      tokens: { access: "access-2" },
      user: { id: 9, email: "refresh@example.com", role: "BUYER" },
    });
  });
});
