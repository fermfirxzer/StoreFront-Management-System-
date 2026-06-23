import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomePage from "./HomePage";
import { useAuthStore } from "../stores/authStore";

const mockLogoutRequest = vi.fn();

vi.mock("../api/auth", () => ({
  logoutRequest: () => mockLogoutRequest(),
}));

describe("HomePage", () => {
  beforeEach(() => {
    mockLogoutRequest.mockReset();
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: false,
    });
  });

  it("shows the buyer call to action", () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "buyer@example.com", role: "BUYER" },
      role: "BUYER",
      isBootstrapping: false,
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Browse products")).toBeInTheDocument();
    expect(screen.getByText("Role: BUYER")).toBeInTheDocument();
  });

  it("logs out and clears the session", async () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
      role: "SELLER",
      isBootstrapping: false,
    });
    mockLogoutRequest.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(mockLogoutRequest).toHaveBeenCalled();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });
});
