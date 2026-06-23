import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Layout from "./Layout";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";

const mockLogoutRequest = vi.fn();

vi.mock("../../api/auth", () => ({
  logoutRequest: () => mockLogoutRequest(),
}));

describe("Layout", () => {
  beforeEach(() => {
    mockLogoutRequest.mockReset();
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: false,
    });
    useCartStore.setState({ itemCount: 0 });
  });

  it("renders the logged-out shell", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Layout>
          <div>Login content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getAllByText("Marketplace").length).toBeGreaterThan(0);
    expect(screen.getByText("Login content")).toBeInTheDocument();
    expect(screen.getByText("For Buyers")).toBeInTheDocument();
    expect(screen.getByText("For Sellers")).toBeInTheDocument();
  });

  it("renders the buyer shell with cart state", () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 2, email: "buyer@example.com", role: "BUYER" },
      role: "BUYER",
      isBootstrapping: false,
    });
    useCartStore.setState({ itemCount: 3 });

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Layout>
          <div>Cart content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getAllByLabelText("Cart, 3 items").length).toBeGreaterThan(0);
    expect(screen.getByText("Cart content")).toBeInTheDocument();
  });

  it("supports signing out from the user menu", async () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
      role: "SELLER",
      isBootstrapping: false,
    });

    render(
      <MemoryRouter initialEntries={["/seller/dashboard"]}>
        <Layout>
          <div>Dashboard content</div>
        </Layout>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /seller@example.com/i }));
    fireEvent.click(screen.getAllByRole("button", { name: "Sign out" })[0]);

    await waitFor(() => {
      expect(mockLogoutRequest).toHaveBeenCalled();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });
});
