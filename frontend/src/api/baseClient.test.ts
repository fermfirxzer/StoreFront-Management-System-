import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("baseClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("creates an axios client with the default base URL", async () => {
    vi.resetModules();
    const createSpy = vi.spyOn(axios, "create");

    const { baseURL, createBaseClient } = await import("./baseClient");
    const client = createBaseClient();

    expect(baseURL).toBe("http://localhost:8000/api");
    expect(createSpy).toHaveBeenCalledWith({
      baseURL: "http://localhost:8000/api",
      withCredentials: true,
    });
    expect(client).toBeDefined();
  });

  it("prefers the Vite env base URL when provided", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    const { baseURL } = await import("./baseClient");

    expect(baseURL).toBe("https://api.example.com");
  });
});
