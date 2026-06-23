import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useAuthStore } from "../stores/authStore";

const mockRefreshRequest = vi.fn();

vi.mock("../api/auth", () => ({
  refreshRequest: () => mockRefreshRequest(),
}));

import AuthBootstrap from "./AuthBootstrap";

describe("AuthBootstrap", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: true,
    });
    mockRefreshRequest.mockReset();
  });

  it("restores the session when refresh succeeds", async () => {
    mockRefreshRequest.mockResolvedValue({
      tokens: { access: "access-1" },
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
    });

    render(<AuthBootstrap />);

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe("access-1");
      expect(useAuthStore.getState().isBootstrapping).toBe(false);
    });
  });

  it("marks bootstrapping complete when refresh fails", async () => {
    mockRefreshRequest.mockRejectedValue(new Error("no cookie"));

    render(<AuthBootstrap />);

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().isBootstrapping).toBe(false);
    });
  });

  it("skips refresh when an access token already exists", async () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
      role: "SELLER",
      isBootstrapping: true,
    });

    render(<AuthBootstrap />);

    await waitFor(() => {
      expect(mockRefreshRequest).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isBootstrapping).toBe(false);
    });
  });
});
