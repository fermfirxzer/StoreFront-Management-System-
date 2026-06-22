import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm";
import type { ProductFormValues } from "../../features/products/schema";
import { createProduct } from "../../api/productApi";
import { getApiErrorMessage } from "../../utils/apiErrors";
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
      <section className="mx-auto max-w-6xl px-6 py-10">
        <AppleButton to="/seller" variant="ghost" className="px-4 py-2 text-[13px]">
          {"<"} Products
        </AppleButton>

        <AppleCard className="mt-8 space-y-4">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-apple-gray">
              Create product
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.04em] leading-tight sm:text-[40px]">
              New Product
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-apple-gray">
              Add a polished listing with clearer spacing, depth, and image preview hierarchy.
            </p>
          </div>

          {errorMessage ? (
            <AppleCard className="border border-apple-red/20 bg-[#fff5f5] text-apple-red">
              <p className="text-[13px] leading-6 animate-shake">{errorMessage}</p>
            </AppleCard>
          ) : null}
        </AppleCard>

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
