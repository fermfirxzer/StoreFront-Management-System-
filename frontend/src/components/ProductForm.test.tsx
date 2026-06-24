import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import ProductForm from "./ProductForm";

describe("ProductForm", () => {
  beforeEach(() => {
    vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:preview");
    vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  it("renders defaults, previews an uploaded image, and submits values", async () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <ProductForm
          defaultValues={{
            title: "Desk lamp",
            description: "Warm light",
            unitPrice: 24.99,
            quantity: 5,
          }}
          existingImageUrl="https://cdn.example.com/current.jpg"
          isLoading={false}
          onSubmit={onSubmit}
          submitLabel="Save Product"
        />
      </MemoryRouter>
    );

    expect(screen.getByAltText("Product preview")).toHaveAttribute(
      "src",
      "https://cdn.example.com/current.jpg"
    );

    const file = new File(["image"], "product.png", { type: "image/png" });
    const input = document.querySelector("input[type='file']");
    expect(input).not.toBeNull();
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(screen.getByAltText("Product preview")).toHaveAttribute("src", "blob:preview");
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");

    fireEvent.change(screen.getByRole("textbox", { name: /Product title/ }), {
      target: { value: "Desk lamp" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Product" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        image: undefined,
        removeImage: true,
      }),
      expect.anything()
    );
  });

  it("shows live counters and clamps numeric inputs to the allowed maximums", async () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <ProductForm isLoading={false} onSubmit={onSubmit} submitLabel="Save Product" />
      </MemoryRouter>
    );

    expect(screen.getByText("0/75")).toBeInTheDocument();
    expect(screen.getByText("0/200")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: /Product title/ }), {
      target: { value: "x".repeat(80) },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Description/ }), {
      target: { value: "y".repeat(220) },
    });

    expect(screen.getByText("75/75")).toBeInTheDocument();
    expect(screen.getByText("200/200")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Product title/ })).toHaveValue("x".repeat(75));
    expect(screen.getByRole("textbox", { name: /Description/ })).toHaveValue("y".repeat(200));

    fireEvent.change(screen.getByRole("spinbutton", { name: /Price/ }), {
      target: { value: "10000001" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /Quantity/ }), {
      target: { value: "1000000" },
    });

    expect(screen.getByRole("spinbutton", { name: /Price/ })).toHaveValue(10000000);
    expect(screen.getByRole("spinbutton", { name: /Quantity/ })).toHaveValue(999999);
  });

  it("keeps numeric fields empty after clearing so retyping does not add a leading zero", () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <ProductForm
          defaultValues={{
            title: "Desk lamp",
            unitPrice: 1000,
            quantity: 1000,
          }}
          isLoading={false}
          onSubmit={onSubmit}
          submitLabel="Save Product"
        />
      </MemoryRouter>
    );

    const priceInput = screen.getByRole("spinbutton", { name: /Price/ });
    const quantityInput = screen.getByRole("spinbutton", { name: /Quantity/ });

    fireEvent.change(priceInput, { target: { value: "" } });
    fireEvent.change(quantityInput, { target: { value: "" } });

    expect(priceInput).toHaveValue(null);
    expect(quantityInput).toHaveValue(null);

    fireEvent.change(priceInput, { target: { value: "1000" } });
    fireEvent.change(quantityInput, { target: { value: "1000" } });

    expect(priceInput).toHaveValue(1000);
    expect(quantityInput).toHaveValue(1000);
  });
});
