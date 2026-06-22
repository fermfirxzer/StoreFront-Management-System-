import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm";
import type { ProductFormValues } from "../../features/products/schema";
import { createProduct } from "../../api/productApi";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { useState } from "react";
import AppleButton from "../../components/apple/AppleButton";
import AppleCard from "../../components/apple/AppleCard";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      navigate("/seller");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "We could not create the product."));
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    setErrorMessage(null);
    await createMutation.mutateAsync(values);
  };

  return (
    <main className="apple-surface min-h-screen text-apple-black animate-fade-in">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <AppleButton to="/seller" variant="ghost">
          ← Products
        </AppleButton>

        <div className="mt-8 space-y-3">
          <p className="text-[13px] font-medium uppercase tracking-[0.2px] text-apple-gray">
            Create product
          </p>
          <h1 className="text-[32px] font-semibold tracking-[-0.04em] sm:text-[40px]">
            New Product
          </h1>
          <p className="max-w-2xl text-[17px] leading-7 text-apple-gray">
            Add a polished listing with a clean image preview and Apple-style form
            controls.
          </p>
        </div>

        {errorMessage ? (
          <AppleCard className="mt-6 border border-apple-red/20 bg-[#fff5f5] text-apple-red">
            <p className="text-[13px] leading-6 animate-shake">{errorMessage}</p>
          </AppleCard>
        ) : null}

        <div className="mt-8">
          <ProductForm
            isLoading={createMutation.isPending}
            onSubmit={handleSubmit}
            submitLabel="Save Product"
          />
        </div>
      </section>
    </main>
  );
}
