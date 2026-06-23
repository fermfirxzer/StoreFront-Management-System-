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

    fireEvent.change(screen.getByLabelText("Product title"), {
      target: { value: "Desk lamp" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Product" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
