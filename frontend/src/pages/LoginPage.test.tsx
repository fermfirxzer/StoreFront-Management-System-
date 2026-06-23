import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { useAuthStore } from "../stores/authStore";

const mockLoginRequest = vi.fn();

vi.mock("../api/auth", () => ({
  loginRequest: (...args: unknown[]) => mockLoginRequest(...args),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockLoginRequest.mockReset();
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: false,
    });
  });

  it("submits credentials and navigates home", async () => {
    mockLoginRequest.mockResolvedValue({
      user: { id: 1, email: "buyer@example.com", role: "BUYER" },
      tokens: { access: "access-1" },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "buyer@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Home page")).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBe("access-1");
  });
});
