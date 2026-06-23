import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import RegisterPage from "./RegisterPage";
import { useAuthStore } from "../stores/authStore";

const mockRegisterRequest = vi.fn();

vi.mock("../api/auth", () => ({
  registerRequest: (...args: unknown[]) => mockRegisterRequest(...args),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    mockRegisterRequest.mockReset();
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: false,
    });
  });

  it("creates an account and navigates home", async () => {
    mockRegisterRequest.mockResolvedValue({
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
      tokens: { access: "access-1" },
    });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "seller@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Home page")).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBe("access-1");
  });
});
