import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../stores/authStore";

describe("ProtectedRoute", () => {
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
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<div>Secret</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
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
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<div>Secret</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "user@example.com", role: "BUYER" },
      role: "BUYER",
      isBootstrapping: false,
    });

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<div>Secret</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Secret")).toBeInTheDocument();
  });
});
