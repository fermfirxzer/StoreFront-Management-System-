import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
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
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { data: product, isLoading, error } = useProductDetailQuery(productId);
  const backTarget = location.search ? `/products${location.search}` : "/products";

  useEffect(() => {
    setSelectedQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedQuantity((quantity) => Math.min(Math.max(1, quantity), Math.max(1, product.quantity)));
  }, [product?.quantity, product]);

  const addToCartMutation = useMutation({
    mutationFn: (quantity: number) => addCartItem({ productId, quantity }),
    onMutate: async (quantity) => {
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
        quantity,
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
            <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-violet-500" />
            <div className="p-5 sm:p-6">
              <div className="h-[360px] rounded-apple-card apple-skeleton animate-shimmer sm:h-[440px] lg:h-[520px]" />
              <div className="mt-6 h-24 rounded-apple-card apple-skeleton animate-shimmer" />
            </div>
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
            <div className="p-5 sm:p-6">
              <div className="flex h-[360px] w-full items-center justify-center overflow-hidden rounded-apple-card bg-[#EEF2FF] p-8 sm:h-[440px] sm:p-10 lg:h-[520px]">
                <img
                  alt={product.image ? product.title : `${product.title} placeholder`}
                  className="max-h-[280px] w-auto max-w-full object-contain object-center sm:max-h-[360px] lg:max-h-[420px]"
                  src={product.image ?? productPlaceholder}
                />
              </div>

              <div className="mt-6 rounded-apple-card bg-[#F8FAFF] p-4">
                <div className="grid gap-4 text-[13px] sm:grid-cols-2">
                  <div>
                    <p className="font-medium uppercase tracking-[0.2px] text-apple-gray">
                      Stock
                    </p>
                    <p className="mt-1 font-semibold text-brand-900">
                      {product.quantity > 0 ? `${product.quantity} available` : "Out of stock"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium uppercase tracking-[0.2px] text-apple-gray">
                      Updated
                    </p>
                    <p className="mt-1 font-semibold text-brand-900">
                      {new Date(product.updatedAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>
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

            <div className="mt-8 space-y-3">
              {role === "BUYER" ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-apple-card bg-[#F8FAFF] p-4">
                    <div>
                      <p className="text-[12px] font-medium uppercase tracking-[0.2px] text-apple-gray">
                        Quantity
                      </p>
                      <p className="mt-1 text-[13px] text-apple-gray">
                        Choose how many to add
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-apple-pill bg-white p-1 shadow-[0_2px_10px_rgba(99,102,241,0.08)]">
                      <button
                        aria-label="Decrease quantity"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-apple-gray transition hover:bg-[#EEF2FF] hover:text-brand-900 disabled:cursor-not-allowed disabled:text-[#B3B3BD]"
                        disabled={selectedQuantity <= 1 || addToCartMutation.isPending}
                        onClick={() => {
                          setSelectedQuantity((quantity) => Math.max(1, quantity - 1));
                        }}
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-[15px] font-semibold text-brand-900">
                        {selectedQuantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-apple-gray transition hover:bg-[#EEF2FF] hover:text-brand-900 disabled:cursor-not-allowed disabled:text-[#B3B3BD]"
                        disabled={selectedQuantity >= product.quantity || addToCartMutation.isPending}
                        onClick={() => {
                          setSelectedQuantity((quantity) => Math.min(product.quantity, quantity + 1));
                        }}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <AppleButton
                      disabled={product.quantity <= 0}
                      loading={addToCartMutation.isPending}
                      onClick={() => {
                        void addToCartMutation.mutateAsync(selectedQuantity);
                      }}
                      variant="primary"
                    >
                      Add to cart
                    </AppleButton>
                    <AppleButton to="/cart" variant="secondary">
                      View cart
                    </AppleButton>
                  </div>
                </div>
              ) : null}
              <div className="flex justify-end">
                <AppleButton to={backTarget} variant="ghost">
                  Back to catalog
                  <ArrowRight className="h-4 w-4" />
                </AppleButton>
              </div>
            </div>
          </AppleCard>
        </div>
      ) : null}
    </section>
  );
}
