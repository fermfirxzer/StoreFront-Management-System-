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
    <section className="animate-fade-in space-y-8">
        <AppleButton
          to="/seller"
          variant="ghost"
          className="px-4 py-2 text-[13px] border-brand-200 text-brand-700"
        >
          {"<"} Products
        </AppleButton>

        <AppleCard className="mt-8 space-y-4 border-t-4 border-t-brand-500">
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
              Create product
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.04em] leading-tight text-brand-900 sm:text-[40px]">
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
  );
}
