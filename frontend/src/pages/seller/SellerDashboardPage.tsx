import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { deleteProduct, getSellerProducts } from "../../api/productApi";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { useAuthStore } from "../../stores/authStore";

type SortOption = "updated-desc" | "price-desc" | "price-asc" | "quantity-desc" | "quantity-asc";

const thaiCurrencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

export default function SellerDashboardPage() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [sortBy, setSortBy] = useState<SortOption>("updated-desc");
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });

  const sortedProducts = [...(products ?? [])].sort((left, right) => {
    switch (sortBy) {
      case "price-desc":
        return right.unitPrice - left.unitPrice;
      case "price-asc":
        return left.unitPrice - right.unitPrice;
      case "quantity-desc":
        return right.quantity - left.quantity;
      case "quantity-asc":
        return left.quantity - right.quantity;
      case "updated-desc":
      default:
        return (
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        );
    }
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-600">
              Seller Studio
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Manage your products with a clean seller workflow.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              This dashboard is backed by the seller-only Django product API and
              cached with TanStack Query.
            </p>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-500"
            to="/seller/products/new"
          >
            Create product
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-3 rounded-[1.75rem] bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/80 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Sort your catalog</p>
            <p className="text-sm text-slate-500">
              Choose how you want to review stock, pricing, or latest updates.
            </p>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <span>Sort by</span>
            <select
              className="rounded-full border-0 bg-slate-100 px-4 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-500"
              onChange={(event) => {
                setSortBy(event.target.value as SortOption);
              }}
              value={sortBy}
            >
              <option value="updated-desc">Latest update</option>
              <option value="quantity-desc">Quantity: high to low</option>
              <option value="quantity-asc">Quantity: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="price-asc">Price: low to high</option>
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="rounded-[2rem] bg-white/80 p-10 text-slate-600 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
            Loading your products...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[2rem] bg-rose-50 p-10 text-rose-700 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-rose-200">
            <div className="space-y-4">
              <p>{getApiErrorMessage(error, "We could not load your products.")}</p>
              <button
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                onClick={() => {
                  clearSession();
                }}
                type="button"
              >
                Return to login
              </button>
            </div>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {sortedProducts.map((product) => (
              <article
                className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80"
                key={product.id}
              >
                <div className="aspect-[4/3] bg-[linear-gradient(135deg,#e2e8f0_0%,#f8fafc_45%,#dbeafe_100%)]">
                  {product.image ? (
                    <img
                      alt={product.title}
                      className="h-full w-full object-cover"
                      src={product.image}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_60%,#e2e8f0_100%)] px-6 text-center">
                      <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm">
                        No Image
                      </div>
                      <p className="max-w-[12rem] text-sm leading-6 text-slate-600">
                        This product will use a clean fallback preview until you upload an image.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {product.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {product.description || "No description added yet."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{thaiCurrencyFormatter.format(product.unitPrice)}</span>
                    <span>{product.quantity} in stock</span>
                  </div>

                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Updated {new Date(product.updatedAt).toLocaleDateString("en-GB")}
                  </p>

                  <div className="flex gap-3">
                    <Link
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      to={`/seller/products/${product.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        void deleteMutation.mutateAsync(product.id);
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!isLoading && !error && sortedProducts.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-slate-600 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
            You have not created any products yet.
          </div>
        ) : null}
      </section>
    </main>
  );
}
