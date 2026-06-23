import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import CreateProductPage from "./CreateProductPage";

const mockNavigate = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockCreateProduct = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
      useNavigate: () => mockNavigate,
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  useMutation: (config: any) => ({
    isPending: false,
    mutateAsync: async (values: unknown) => {
      const result = await config.mutationFn(values);
      await config.onSuccess?.(result, values, undefined);
      return result;
    },
  }),
}));

vi.mock("../../api/productApi", () => ({
  createProduct: (...args: unknown[]) => mockCreateProduct(...args),
}));

describe("CreateProductPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockInvalidateQueries.mockReset();
    mockCreateProduct.mockReset();
  });

  it("creates a product and navigates back to seller", async () => {
    mockCreateProduct.mockResolvedValue({
      id: "product-1",
      title: "Desk lamp",
    });

    render(
      <MemoryRouter initialEntries={["/seller/products/create"]}>
        <CreateProductPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Product title"), {
      target: { value: "Desk lamp" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Warm light" },
    });
    fireEvent.change(screen.getByPlaceholderText("149.99"), {
      target: { value: "24.99" },
    });
    fireEvent.change(screen.getByPlaceholderText("12"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Product" }));

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalled();
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["seller-products"] });
      expect(mockNavigate).toHaveBeenCalledWith("/seller");
    });
  });
});
