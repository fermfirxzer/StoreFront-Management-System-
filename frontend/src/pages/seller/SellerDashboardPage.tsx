import { useState } from "react";
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

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      setDeletingId(null);
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

  return (
    <main className="apple-surface min-h-screen text-apple-black animate-fade-in">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-[13px] font-medium uppercase tracking-[0.2px] text-apple-gray">
              Seller dashboard
            </p>
            <h1 className="text-[32px] font-semibold tracking-[-0.04em] sm:text-[40px]">
              My Products
            </h1>
            <p className="text-[17px] leading-7 text-apple-gray">
              {sortedProducts.length} products
            </p>
          </div>

          <AppleButton to="/seller/products/new" variant="primary">
            Add Product
          </AppleButton>
        </div>

        <AppleCard className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[17px] font-medium text-apple-black">Sort catalog</p>
            <p className="mt-1 text-[13px] text-apple-gray">
              Review products by recency, price, or quantity.
            </p>
          </div>

          <label className="flex items-center gap-3 text-[15px] font-medium text-apple-black">
            <span>Sort by</span>
            <select
              className="rounded-apple-pill border border-apple-border bg-white px-4 py-3 text-[15px] text-apple-black outline-none transition-all duration-150 ease-apple focus:border-apple-blue focus:shadow-apple-focus"
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
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <AppleCard key={index} className="space-y-4" interactive>
                <div className="aspect-[16/9] rounded-apple-input apple-skeleton animate-shimmer" />
                <div className="space-y-3">
                  <div className="h-5 w-3/4 rounded-full apple-skeleton animate-shimmer" />
                  <div className="h-4 w-1/2 rounded-full apple-skeleton animate-shimmer" />
                  <div className="h-4 w-24 rounded-full apple-skeleton animate-shimmer" />
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
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sortedProducts.map((product) => {
              const isDeleting = deleteMutation.isPending && deletingId === product.id;

              return (
                <AppleCard as="article" className="overflow-hidden p-0" interactive key={product.id}>
                  <div className="aspect-[16/9] bg-apple-gray-light">
                    {product.image ? (
                      <img
                        alt={product.title}
                        className="h-full w-full object-cover"
                        src={product.image}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#f5f5f7]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                          <svg
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="h-8 w-8 text-apple-gray"
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
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-6">
                    <div>
                      <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-apple-black">
                        {product.title}
                      </h2>
                      <p className="mt-2 text-[15px] leading-7 text-apple-gray">
                        {product.description || "No description added yet."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[17px] font-medium text-apple-black">
                        {thaiCurrencyFormatter.format(product.unitPrice)}
                      </span>
                      <span
                        className={[
                          "rounded-apple-pill px-3 py-1 text-[12px] font-medium",
                          product.quantity > 0
                            ? "bg-[#eaf8ef] text-apple-green"
                            : "bg-[#fff0ef] text-apple-red",
                        ].join(" ")}
                      >
                        {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                      </span>
                    </div>

                    <p className="text-[12px] uppercase tracking-[0.2px] text-apple-gray">
                      Updated {new Date(product.updatedAt).toLocaleDateString("en-GB")}
                    </p>

                    <div className="flex gap-3">
                      <AppleButton fullWidth to={`/seller/products/${product.id}/edit`} variant="secondary">
                        Edit
                      </AppleButton>
                      <AppleButton
                        fullWidth
                        loading={isDeleting}
                        onClick={() => {
                          setDeletingId(product.id);
                          void deleteMutation.mutateAsync(product.id);
                        }}
                        variant="destructive"
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-apple-gray-light">
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                className="h-8 w-8 text-apple-gray"
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
            <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-apple-black">
              No products yet
            </h2>
            <p className="mt-3 max-w-md text-[17px] leading-7 text-apple-gray">
              Start by adding your first product.
            </p>
            <div className="mt-8">
              <AppleButton to="/seller/products/new" variant="primary">
                Add Product
              </AppleButton>
            </div>
          </AppleCard>
        ) : null}
      </section>
    </main>
  );
}
