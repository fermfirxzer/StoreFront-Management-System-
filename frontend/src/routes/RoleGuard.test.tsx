import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import RoleGuard from "./RoleGuard";
import { useAuthStore } from "../stores/authStore";

describe("RoleGuard", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: true,
    });
  });

  it("shows the bootstrapping message while restoring the session", () => {
    render(
      <MemoryRouter initialEntries={["/seller"]}>
        <Routes>
          <Route element={<RoleGuard allowedRole="SELLER" />}>
            <Route path="/seller" element={<div>Seller area</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Restoring your session...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", async () => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: false,
    });

    render(
      <MemoryRouter initialEntries={["/seller"]}>
        <Routes>
          <Route element={<RoleGuard allowedRole="SELLER" />}>
            <Route path="/seller" element={<div>Seller area</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("redirects users with the wrong role to home", async () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "user@example.com", role: "BUYER" },
      role: "BUYER",
      isBootstrapping: false,
    });

    render(
      <MemoryRouter initialEntries={["/seller"]}>
        <Routes>
          <Route element={<RoleGuard allowedRole="SELLER" />}>
            <Route path="/seller" element={<div>Seller area</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Home page")).toBeInTheDocument();
  });

  it("renders protected content for the allowed role", () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
      role: "SELLER",
      isBootstrapping: false,
    });

    render(
      <MemoryRouter initialEntries={["/seller"]}>
        <Routes>
          <Route element={<RoleGuard allowedRole="SELLER" />}>
            <Route path="/seller" element={<div>Seller area</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Seller area")).toBeInTheDocument();
  });
});
