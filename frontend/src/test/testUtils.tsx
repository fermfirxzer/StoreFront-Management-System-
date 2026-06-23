import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function renderWithRouter(
  ui: ReactElement,
  { route = "/" }: { route?: string } = {}
) {
  window.history.pushState({}, "Test page", route);
  return render(ui, { wrapper: ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  ) });
}
