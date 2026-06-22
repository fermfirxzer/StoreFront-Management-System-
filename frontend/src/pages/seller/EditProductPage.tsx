import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ProductForm from "../../components/ProductForm";
import type { ProductFormValues } from "../../features/products/schema";
import { getSellerProductById, updateProduct } from "../../api/productApi";
import { getApiErrorMessage } from "../../utils/apiErrors";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fee2e2_0%,#f8fafc_40%,#ffffff_100%)] text-slate-900">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link className="text-sm font-medium text-sky-600 hover:text-sky-500" to="/seller">
          Back to dashboard
        </Link>
        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-rose-600">
            Edit product
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Update an existing seller listing.
          </h1>

          {isLoading ? <p className="mt-6 text-slate-600">Loading product details...</p> : null}
          {error ? (
            <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getApiErrorMessage(error, "We could not load that product.")}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
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
                submitLabel="Update product"
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
