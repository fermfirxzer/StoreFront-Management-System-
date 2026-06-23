import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

                    <div className="mt-4 flex gap-2 px-0 pb-0">
                      <AppleButton
                        fullWidth
                        to={`/seller/products/${product.id}/edit`}
                        variant="secondary"
                        className="px-4 py-2 text-[13px]"
                      >
                        Edit
                      </AppleButton>
                      <AppleButton
                        fullWidth
                        onClick={() => {
                          deleteMutation.reset();
                          setPendingDeleteProduct({
                            id: product.id,
                            title: product.title,
                          });
                        }}
                        variant="destructive"
                        className="px-4 py-2 text-[13px]"
                      >
                        Delete
                      </AppleButton>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            deleteMutation.reset();
            setPendingDeleteProduct(null);
          }}
        >
          <AppleCard
            aria-describedby="delete-product-description"
            aria-labelledby="delete-product-title"
            aria-modal="true"
            className="w-full max-w-[440px] overflow-hidden border border-[#E0E7FF] bg-white p-0 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
            onClick={(event) => {
              event.stopPropagation();
            }}
            role="dialog"
          >
            <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-[#FF5A52] to-[#FF3B30]" />
            <div className="px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
              <div className="mb-4 flex items-start gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-[#D92D20] sm:h-12 sm:w-12">
                  <svg
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  >
                    <path
                      d="M12 9v4m0 4h.01M10.3 4.1l-7.1 12.2A2 2 0 0 0 4.9 19h14.2a2 2 0 0 0 1.7-2.7L13.7 4.1a2 2 0 0 0-3.4 0Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#D92D20]">
                    Confirm deletion
                  </p>
                  <h2
                    className="text-[22px] font-bold tracking-[-0.03em] leading-tight text-[#1E1B4B] sm:text-[24px]"
                    id="delete-product-title"
                  >
                    Delete this product?
                  </h2>
                </div>
              </div>

              <p
                className="text-[15px] leading-7 text-[#6E6E73]"
                id="delete-product-description"
              >
                This will permanently remove{" "}
                <span className="font-semibold text-[#1E1B4B]">
                  {pendingDeleteProduct.title}
                </span>{" "}
                from your seller dashboard. This action cannot be undone.
              </p>

              {deleteMutation.isError ? (
                <p className="mt-4 rounded-[14px] border border-[#FECACA] bg-[#FFF1F1] px-4 py-3 text-[13px] leading-6 text-apple-red">
                  We could not delete that product. Please try again.
                </p>
              ) : null}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <AppleButton
                  fullWidth
                  variant="ghost"
                  onClick={() => {
                    deleteMutation.reset();
                    setPendingDeleteProduct(null);
                  }}
                  className="h-12 bg-[#F5F5F7] px-6 text-[15px] text-[#1E1B4B] hover:bg-[#E8E8ED] focus-visible:ring-brand-500 sm:w-[132px]"
                >
                  Cancel
                </AppleButton>
                <AppleButton
                  fullWidth
                  loading={deleteMutation.isPending && deletingId === pendingDeleteProduct.id}
                  onClick={() => {
                    setDeletingId(pendingDeleteProduct.id);
                    void deleteMutation.mutateAsync(pendingDeleteProduct.id);
                  }}
                  variant="destructive"
                  className="h-12 px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(255,59,48,0.34)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.44)] focus-visible:ring-[#FF3B30] sm:w-[132px]"
                >
                  Delete
                </AppleButton>
              </div>
            </div>
          </AppleCard>
        </div>
      ) : null}
    </>
  );
}
