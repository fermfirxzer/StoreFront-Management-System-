import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { addCartItem } from "../api/cartApi";
import productPlaceholder from "../assets/product-placeholder.svg";
import AppleButton from "../components/apple/AppleButton";
import AppleCard from "../components/apple/AppleCard";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import { useProductDetailQuery } from "../hooks/useProductQueries";
import { getApiErrorMessage } from "../utils/apiErrors";
import type { Cart } from "../types/cart";

const thaiCurrencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

export default function ProductDetailPage() {
  const { productId = "" } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const setCart = useCartStore((state) => state.setCart);
  const optimisticAddItem = useCartStore((state) => state.optimisticAddItem);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const { data: product, isLoading, error } = useProductDetailQuery(productId);
  const backTarget = location.search ? `/products${location.search}` : "/products";
  const addToCartMutation = useMutation({
    mutationFn: () => addCartItem({ productId, quantity: 1 }),
    onMutate: async () => {
      if (!product) {
        return { previousCart: useCartStore.getState().cart, previousQueryCart: undefined as Cart | undefined };
      }

      setCartMessage(null);
      const previousCart = useCartStore.getState().cart;
      const previousQueryCart = queryClient.getQueryData<Cart>(["cart"]);
      optimisticAddItem({
        product: {
          id: product.id,
          title: product.title,
          unitPrice: product.unitPrice,
          image: product.image,
          availableQuantity: product.quantity,
        },
        quantity: 1,
      });
      return { previousCart, previousQueryCart };
    },
    onError: (mutationError, _variables, context) => {
      setCart(context?.previousCart ?? null);
      queryClient.setQueryData(["cart"], context?.previousQueryCart);
      setCartMessage(getApiErrorMessage(mutationError, "We could not add that item to the cart."));
    },
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(["cart"], cart);
      setCartMessage("Added to cart.");
    },
  });

  return (
    <section className="animate-fade-in space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand-700 transition hover:text-brand-900"
        to={backTarget}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <AppleCard className="overflow-hidden p-0">
            <div className="aspect-[4/3] apple-skeleton animate-shimmer" />
          </AppleCard>
          <AppleCard className="space-y-4">
            <div className="h-4 w-24 rounded-full apple-skeleton animate-shimmer" />
            <div className="h-10 w-3/4 rounded-full apple-skeleton animate-shimmer" />
            <div className="h-6 w-40 rounded-full apple-skeleton animate-shimmer" />
            <div className="h-20 w-full rounded-apple-input apple-skeleton animate-shimmer" />
          </AppleCard>
        </div>
      ) : null}

      {error ? (
        <AppleCard className="border border-apple-red/20 bg-[#fff5f5] text-apple-red">
          <p className="text-[13px] leading-6 animate-shake">
            {getApiErrorMessage(error, "We could not load that product.")}
          </p>
        </AppleCard>
      ) : null}

      {product ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <AppleCard className="overflow-hidden p-0">
            <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-violet-500" />
            <div className="aspect-[4/3] bg-[#EEF2FF]">
              <img
                alt={product.image ? product.title : `${product.title} placeholder`}
                className="h-full w-full object-cover"
                src={product.image ?? productPlaceholder}
              />
            </div>
          </AppleCard>

          <AppleCard className="border-t-4 border-t-brand-500 p-6 shadow-[0_20px_60px_rgba(99,102,241,0.12)] sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
              Product detail
            </p>
            <h1 className="mt-3 text-[32px] font-bold tracking-[-0.04em] text-brand-900 sm:text-[40px]">
              {product.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[24px] font-bold text-[#4338CA]">
                {thaiCurrencyFormatter.format(product.unitPrice)}
              </span>
              <span
                className={
                  product.quantity > 0
                    ? "inline-flex items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5 text-[12px] font-bold text-[#4338CA]"
                    : "inline-flex items-center gap-1.5 rounded-full border border-[#FECACA] bg-[#FEE2E2] px-3 py-1.5 text-[12px] font-bold text-[#991B1B]"
                }
              >
                <span
                  className={[
                    "inline-block h-1.5 w-1.5 rounded-full",
                    product.quantity > 0 ? "bg-[#6366F1]" : "bg-[#FF3B30]",
                  ].join(" ")}
                />
                {product.quantity > 0 ? `${product.quantity} available` : "Out of stock"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 rounded-apple-card bg-[#F8FAFF] p-5 sm:grid-cols-2">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.2px] text-apple-gray">
                  Seller
                </p>
                <p className="mt-1 text-[15px] font-semibold text-brand-900">
                  {product.seller.email}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.2px] text-apple-gray">
                  Listed on
                </p>
                <p className="mt-1 text-[15px] font-semibold text-brand-900">
                  {new Date(product.createdAt).toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.2px] text-apple-gray">
                Description
              </p>
              <p className="mt-3 text-[16px] leading-8 text-apple-gray">
                {product.description || "No description provided for this product."}
              </p>
            </div>

            {cartMessage ? (
              <p className="mt-6 text-[13px] leading-6 text-brand-700">{cartMessage}</p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {role === "BUYER" ? (
                <AppleButton
                  disabled={product.quantity <= 0}
                  loading={addToCartMutation.isPending}
                  onClick={() => {
                    void addToCartMutation.mutateAsync();
                  }}
                  variant="primary"
                >
                  Add to cart
                </AppleButton>
              ) : null}
              {role === "BUYER" ? (
                <AppleButton to="/cart" variant="secondary">
                  View cart
                </AppleButton>
              ) : null}
              <AppleButton to={backTarget} variant="ghost">
                Back to catalog
              </AppleButton>
            </div>
          </AppleCard>
        </div>
      ) : null}
    </section>
  );
}
