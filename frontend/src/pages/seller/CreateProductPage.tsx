import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm";
import type { ProductFormValues } from "../../features/products/schema";
import { createProduct } from "../../api/productApi";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { useState } from "react";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dcfce7_0%,#f8fafc_40%,#ffffff_100%)] text-slate-900">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Link className="text-sm font-medium text-sky-600 hover:text-sky-500" to="/seller">
          Back to dashboard
        </Link>
        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-600">
            Create product
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Add a new listing to your seller catalog.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            This form sends `multipart/form-data`, which is why it can upload the
            image file together with the text fields in one request.
          </p>

          {errorMessage ? (
            <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-8">
            <ProductForm
              isLoading={createMutation.isPending}
              onSubmit={handleSubmit}
              submitLabel="Create product"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
