import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteProduct, getSellerProducts } from "../../api/productApi";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { useAuthStore } from "../../stores/authStore";
import AppleButton from "../../components/apple/AppleButton";
import AppleCard from "../../components/apple/AppleCard";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      setDeletingId(null);
      setPendingDeleteProduct(null);
    },
    onError: () => {
      setDeletingId(null);
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

  useEffect(() => {
    if (!pendingDeleteProduct) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        deleteMutation.reset();
        setPendingDeleteProduct(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteMutation, pendingDeleteProduct]);

  return (
    <>
      <section className="animate-fade-in space-y-8">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-10 w-1 rounded-full bg-gradient-to-b from-brand-500 to-violet-500" />
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
                Seller dashboard
              </p>
              <h1 className="text-[32px] font-bold tracking-[-0.04em] leading-tight text-brand-900 sm:text-[40px]">
                My Products
              </h1>
              <p className="text-[15px] text-apple-gray">
                {sortedProducts.length} products listed
              </p>
            </div>
          </div>

          <AppleButton
            to="/seller/products/create"
            variant="primary"
            className="px-5 py-2.5 text-[15px]"
          >
            Add Product
          </AppleButton>
        </div>

        <AppleCard className="mt-8 flex flex-col gap-4 border-l-4 border-brand-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-brand-900">Sort catalog</p>
            <p className="mt-0.5 text-[12px] text-apple-gray">
              Review products by recency, price, or quantity.
            </p>
          </div>

          <label className="flex items-center gap-3 text-[13px] font-medium text-apple-black">
            <span>Sort by</span>
            <select
              className="cursor-pointer rounded-[12px] border border-brand-200 bg-surface-input px-3 py-2 text-[13px] font-medium text-brand-700 outline-none transition-all duration-150 ease-apple focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
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
        </AppleCard>

        {isLoading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <AppleCard key={index} className="space-y-4 overflow-hidden p-0" interactive>
                <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-violet-500" />
                <div className="px-6 pb-6 pt-5 space-y-4">
                  <div className="aspect-[16/9] rounded-apple-input apple-skeleton animate-shimmer" />
                  <div className="space-y-3">
                    <div className="h-5 w-3/4 rounded-full apple-skeleton animate-shimmer" />
                    <div className="h-4 w-1/2 rounded-full apple-skeleton animate-shimmer" />
                    <div className="h-4 w-24 rounded-full apple-skeleton animate-shimmer" />
                  </div>
                </div>
              </AppleCard>
            ))}
          </div>
        ) : null}

        {error ? (
          <AppleCard className="mt-8 border border-apple-red/20 bg-[#fff5f5] text-apple-red">
            <p className="text-[13px] leading-6 animate-shake">
              {getApiErrorMessage(error, "We could not load your products.")}
            </p>
            <div className="mt-4">
              <AppleButton
                variant="destructive"
                onClick={() => {
                  clearSession();
                }}
              >
                Return to login
              </AppleButton>
            </div>
          </AppleCard>
        ) : null}

        {!isLoading && !error && sortedProducts.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {sortedProducts.map((product) => {
              return (
                <AppleCard
                  as="article"
                  className="overflow-hidden border border-[#E0E7FF] p-0 shadow-[0_2px_12px_rgba(99,102,241,0.08)] hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(99,102,241,0.15)]"
                  interactive
                  key={product.id}
                >
                  <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-violet-500" />
                  <div className="aspect-video bg-[#EEF2FF]">
                    {product.image ? (
                      <img
                        alt={product.title}
                        className="h-full w-full object-cover"
                        src={product.image}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-t-[18px] bg-[#EEF2FF]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0E7FF]">
                          <svg
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 text-[#6366F1]"
                          >
                            <path
                              d="M4 7.5h16v9H4zM8 7.5l2-3h4l2 3M4 16.5h16"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </div>
                        <span className="text-[11px] font-medium text-[#6366F1]">
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 px-4 pb-4 pt-4">
                    <div>
                      <h2 className="text-[15px] font-semibold tracking-[-0.01em] leading-snug text-brand-900">
                        {product.title}
                      </h2>
                      <p className="mt-1 text-[13px] leading-6 text-apple-gray line-clamp-2">
                        {product.description || "No description added yet."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[17px] font-bold text-[#4338CA]">
                        {thaiCurrencyFormatter.format(product.unitPrice)}
                      </span>
                      <span
                        className={
                          product.quantity > 0
                            ? "inline-flex items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-bold text-[#4338CA]"
                            : "inline-flex items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FEE2E2] px-2.5 py-1 text-[11px] font-bold text-[#991B1B]"
                        }
                      >
                        <span
                          className={[
                            "inline-block h-1.5 w-1.5 rounded-full",
                            product.quantity > 0 ? "bg-[#6366F1]" : "bg-[#FF3B30]",
                          ].join(" ")}
                        />
                        {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                      </span>
                    </div>

                    <p className="text-[12px] uppercase tracking-[0.2px] text-apple-gray">
                      Updated {new Date(product.updatedAt).toLocaleDateString("en-GB")}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Link
                        className="inline-flex h-11 items-center justify-center rounded-2xl bg-violet-50 px-5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
                        to={`/seller/products/${product.id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          deleteMutation.reset();
                          setPendingDeleteProduct({
                            id: product.id,
                            title: product.title,
                          });
                        }}
                        className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </AppleCard>
              );
            })}
          </div>
        ) : null}

        {!isLoading && !error && sortedProducts.length === 0 ? (
          <AppleCard className="mt-8 grid place-items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 shadow-sm">
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                className="h-8 w-8 text-brand-600"
              >
                <path
                  d="M4 7.5h16v9H4zM8 7.5l2-3h4l2 3M4 16.5h16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-brand-900">
              No products yet
            </h2>
            <p className="mt-3 max-w-md text-[17px] leading-7 text-apple-gray">
              Start by adding your first product.
            </p>
            <div className="mt-8">
              <AppleButton
                to="/seller/products/create"
                variant="primary"
                className="px-5 py-2.5 text-[15px]"
              >
                Add Product
              </AppleButton>
            </div>
          </AppleCard>
        ) : null}
      </section>

      {pendingDeleteProduct ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            deleteMutation.reset();
            setPendingDeleteProduct(null);
          }}
        >
          <div
            aria-describedby="delete-product-description"
            aria-labelledby="delete-product-title"
            aria-modal="true"
            className="w-full max-w-[480px] rounded-[28px] bg-white p-8 shadow-2xl shadow-slate-900/20 ring-1 ring-brand-100 sm:p-10"
            onClick={(event) => {
              event.stopPropagation();
            }}
            role="dialog"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-500">
                  Confirm Deletion
                </p>
                <h2
                  className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
                  id="delete-product-title"
                >
                  Delete this product?
                </h2>
              </div>
            </div>

            <p
              className="mt-5 text-sm leading-7 text-slate-600"
              id="delete-product-description"
            >
              This will permanently remove{" "}
              <span className="font-semibold text-slate-900">
                {pendingDeleteProduct.title}
              </span>{" "}
              from your seller dashboard. This action cannot be undone.
            </p>

            {deleteMutation.isError ? (
              <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                We could not delete that product. Please try again.
              </p>
            ) : null}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  deleteMutation.reset();
                  setPendingDeleteProduct(null);
                }}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending && deletingId === pendingDeleteProduct.id}
                onClick={() => {
                  setDeletingId(pendingDeleteProduct.id);
                  void deleteMutation.mutateAsync(pendingDeleteProduct.id);
                }}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-red-500 px-4 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-progress disabled:opacity-70"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
