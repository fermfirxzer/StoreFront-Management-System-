import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ProductForm from "../../components/ProductForm";
import type { ProductFormValues } from "../../features/products/schema";
import { getSellerProductById, updateProduct } from "../../api/productApi";
import { getApiErrorMessage } from "../../utils/apiErrors";
import AppleButton from "../../components/apple/AppleButton";
import AppleCard from "../../components/apple/AppleCard";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["seller-product", productId],
    queryFn: () => getSellerProductById(productId ?? ""),
    enabled: Boolean(productId),
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) => updateProduct(productId ?? "", values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      await queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
      navigate("/seller");
    },
    onError: (mutationError) => {
      setErrorMessage(getApiErrorMessage(mutationError, "We could not update the product."));
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    setErrorMessage(null);
    await updateMutation.mutateAsync(values);
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
              Edit product
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.04em] leading-tight sm:text-[40px]">
              Edit Product
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-apple-gray">
              Refine the title, pricing, quantity, or image with clearer visual grouping.
            </p>
          </div>

          {error ? (
            <AppleCard className="border border-apple-red/20 bg-[#fff5f5] text-apple-red">
              <p className="text-[13px] leading-6 animate-shake">
                {getApiErrorMessage(error, "We could not load that product.")}
              </p>
            </AppleCard>
          ) : null}

          {errorMessage ? (
            <AppleCard className="border border-apple-red/20 bg-[#fff5f5] text-apple-red">
              <p className="text-[13px] leading-6 animate-shake">{errorMessage}</p>
            </AppleCard>
          ) : null}
        </AppleCard>

        {isLoading ? (
          <AppleCard className="mt-8 space-y-4">
            <div className="space-y-3">
              <div className="h-4 w-28 rounded-full apple-skeleton animate-shimmer" />
              <div className="h-8 w-48 rounded-full apple-skeleton animate-shimmer" />
              <div className="h-5 w-72 rounded-full apple-skeleton animate-shimmer" />
            </div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
              <div className="space-y-4 rounded-apple-card bg-apple-gray-light p-6">
                <div className="h-4 w-32 rounded-full apple-skeleton animate-shimmer" />
                <div className="h-12 rounded-apple-input apple-skeleton animate-shimmer" />
                <div className="h-4 w-28 rounded-full apple-skeleton animate-shimmer" />
                <div className="h-32 rounded-apple-input apple-skeleton animate-shimmer" />
              </div>
              <div className="space-y-4 rounded-apple-card bg-apple-gray-light p-6">
                <div className="h-4 w-28 rounded-full apple-skeleton animate-shimmer" />
                <div className="h-64 rounded-apple-card apple-skeleton animate-shimmer" />
              </div>
            </div>
          </AppleCard>
        ) : null}

        {product ? (
          <div className="mt-8">
            <ProductForm
              defaultValues={{
                title: product.title,
                description: product.description,
                unitPrice: product.unitPrice,
                quantity: product.quantity,
              }}
              existingImageUrl={product.image}
              isLoading={updateMutation.isPending}
              onSubmit={handleSubmit}
              submitLabel="Save Product"
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
