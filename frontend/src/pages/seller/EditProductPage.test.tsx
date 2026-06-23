import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import EditProductPage from "./EditProductPage";

const mockNavigate = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockUpdateProduct = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ productId: "product-1" }),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  useQuery: () => ({
    data: {
      id: "product-1",
      title: "Desk lamp",
      description: "Warm light",
      unitPrice: 24.99,
      quantity: 5,
      image: "https://cdn.example.com/product.jpg",
    },
    isLoading: false,
    error: null,
  }),
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
  getSellerProductById: vi.fn(),
  updateProduct: (...args: unknown[]) => mockUpdateProduct(...args),
}));

describe("EditProductPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockInvalidateQueries.mockReset();
    mockUpdateProduct.mockReset();
  });

  it("loads the product and submits updates", async () => {
    mockUpdateProduct.mockResolvedValue({
      id: "product-1",
      title: "Desk lamp pro",
    });

    render(
      <MemoryRouter initialEntries={["/seller/products/product-1/edit"]}>
        <Routes>
          <Route path="/seller/products/:productId/edit" element={<EditProductPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue("Desk lamp")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Product title"), {
      target: { value: "Desk lamp pro" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Product" }));

    await waitFor(() => {
      expect(mockUpdateProduct).toHaveBeenCalledWith("product-1", expect.any(Object));
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["seller-products"] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["seller-product", "product-1"],
      });
      expect(mockNavigate).toHaveBeenCalledWith("/seller");
    });
  });
});
