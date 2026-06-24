import { useEffect } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { removeCartItem, updateCartItemQuantity } from "../api/cartApi";
import { checkoutCart } from "../api/orderApi";
import AppleButton from "../components/apple/AppleButton";
import AppleCard from "../components/apple/AppleCard";
import { useCartQuery } from "../hooks/useCartQueries";
import { useCartStore } from "../stores/cartStore";
import { getApiErrorMessage } from "../utils/apiErrors";
import type { Cart } from "../types/cart";
import type { Order } from "../types/order";

const thaiCurrencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

export default function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCartQuery(true);
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const optimisticUpdateItem = useCartStore((state) => state.optimisticUpdateItem);
  const optimisticRemoveItem = useCartStore((state) => state.optimisticRemoveItem);

  useEffect(() => {
    if (data) {
      setCart(data);
    }
  }, [data, setCart]);

  const currentCart = cart ?? data ?? null;

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      const previousCart = useCartStore.getState().cart;
      const previousQueryCart = queryClient.getQueryData<Cart>(["cart"]);
      optimisticUpdateItem({ itemId, quantity });
      return { previousCart, previousQueryCart };
    },
    onError: (_error, _variables, context) => {
      setCart(context?.previousCart ?? null);
      queryClient.setQueryData(["cart"], context?.previousQueryCart);
    },
    onSuccess: (nextCart) => {
      setCart(nextCart);
      queryClient.setQueryData(["cart"], nextCart);
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: removeCartItem,
    onMutate: async (itemId) => {
      const previousCart = useCartStore.getState().cart;
      const previousQueryCart = queryClient.getQueryData<Cart>(["cart"]);
      optimisticRemoveItem(itemId);
      return { previousCart, previousQueryCart };
    },
    onError: (_error, _variables, context) => {
      setCart(context?.previousCart ?? null);
      queryClient.setQueryData(["cart"], context?.previousQueryCart);
    },
    onSuccess: (nextCart) => {
      setCart(nextCart);
      queryClient.setQueryData(["cart"], nextCart);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: checkoutCart,
    onMutate: async () => {
      const previousCart = useCartStore.getState().cart;
      const previousQueryCart = queryClient.getQueryData<Cart>(["cart"]);
      return { previousCart, previousQueryCart };
    },
    onError: (_error, _variables, context) => {
      setCart(context?.previousCart ?? null);
      queryClient.setQueryData(["cart"], context?.previousQueryCart);
    },
    onSuccess: (order) => {
      setCart({
        id: "checked-out-cart",
        items: [],
        totalQuantity: 0,
        subtotal: 0,
        updatedAt: new Date().toISOString(),
      });
      queryClient.setQueryData(["cart"], {
        id: "checked-out-cart",
        items: [],
        totalQuantity: 0,
        subtotal: 0,
        updatedAt: new Date().toISOString(),
      } satisfies Cart);
      queryClient.setQueryData<Order[]>(["orders"], (existingOrders = []) => [order, ...existingOrders]);
      navigate("/history");
    },
  });

  return (
    <section className="space-y-6">
      <AppleCard className="border-t-4 border-t-violet-500">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-violet-600">
          Buyer area
        </p>
        <h1 className="mt-3 text-[32px] font-bold tracking-[-0.04em] text-brand-900 sm:text-[40px]">
          Cart
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-apple-gray">
          Review your selected items, adjust quantities, and keep everything in sync before checkout.
        </p>
      </AppleCard>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
          <AppleCard className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 rounded-apple-input apple-skeleton animate-shimmer" />
            ))}
          </AppleCard>
          <AppleCard className="space-y-4">
            <div className="h-6 w-1/2 rounded-full apple-skeleton animate-shimmer" />
            <div className="h-16 rounded-apple-input apple-skeleton animate-shimmer" />
          </AppleCard>
        </div>
      ) : null}

      {error ? (
        <AppleCard className="border border-apple-red/20 bg-[#fff5f5] text-apple-red">
          <p className="text-[13px] leading-6 animate-shake">
            {getApiErrorMessage(error, "We could not load your cart.")}
          </p>
        </AppleCard>
      ) : null}

      {!isLoading && !error && currentCart ? (
        currentCart.items.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
            <div className="space-y-4">
              {currentCart.items.map((item) => (
                <AppleCard key={item.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <p className="line-clamp-1 text-[18px] font-semibold tracking-[-0.02em] text-brand-900">
                      {item.product.title}
                    </p>
                    <p className="text-[14px] text-apple-gray">
                      {thaiCurrencyFormatter.format(item.product.unitPrice)} each
                    </p>
                    <p className="text-[14px] font-semibold text-[#4338CA]">
                      {thaiCurrencyFormatter.format(item.lineTotal)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="flex items-center gap-2 rounded-apple-pill bg-[#F5F5F7] p-1">
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-apple-gray transition hover:bg-white hover:text-brand-900 disabled:cursor-not-allowed disabled:text-[#B3B3BD]"
                        disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                        onClick={() => {
                          void updateQuantityMutation.mutateAsync({
                            itemId: item.id,
                            quantity: item.quantity - 1,
                          });
                        }}
                        type="button"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center text-[15px] font-semibold text-brand-900">
                        {item.quantity}
                      </span>
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-apple-gray transition hover:bg-white hover:text-brand-900 disabled:cursor-not-allowed disabled:text-[#B3B3BD]"
                        disabled={
                          item.quantity >= item.product.availableQuantity || updateQuantityMutation.isPending
                        }
                        onClick={() => {
                          void updateQuantityMutation.mutateAsync({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          });
                        }}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      className="inline-flex items-center gap-2 rounded-apple-pill px-3 py-2 text-[14px] font-semibold text-[#FF3B30] transition hover:bg-[#FFF1F0]"
                      disabled={removeItemMutation.isPending}
                      onClick={() => {
                        void removeItemMutation.mutateAsync(item.id);
                      }}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </AppleCard>
              ))}
            </div>

            <AppleCard className="border-t-4 border-t-brand-500 p-6 shadow-[0_20px_60px_rgba(99,102,241,0.12)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
                Summary
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-[15px] text-apple-gray">
                  <span>Total items</span>
                  <span>{currentCart.totalQuantity}</span>
                </div>
                <div className="flex items-center justify-between text-[18px] font-semibold text-brand-900">
                  <span>Subtotal</span>
                  <span>{thaiCurrencyFormatter.format(currentCart.subtotal)}</span>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <AppleButton to="/products" variant="secondary">
                  Continue shopping
                </AppleButton>
                <AppleButton
                  loading={checkoutMutation.isPending}
                  onClick={() => {
                    void checkoutMutation.mutateAsync();
                  }}
                  variant="primary"
                >
                  Checkout
                </AppleButton>
                {checkoutMutation.isError ? (
                  <p className="text-[13px] leading-6 text-apple-red">
                    {getApiErrorMessage(checkoutMutation.error, "We could not complete checkout.")}
                  </p>
                ) : null}
              </div>
            </AppleCard>
          </div>
        ) : (
          <AppleCard className="grid place-items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 shadow-sm">
              <ShoppingCart className="h-8 w-8 text-brand-600" />
            </div>
            <h2 className="mt-6 text-[24px] font-semibold tracking-[-0.03em] text-brand-900">
              Your cart is empty
            </h2>
            <p className="mt-3 max-w-md text-[17px] leading-7 text-apple-gray">
              Add a few products and they will appear here for checkout.
            </p>
            <div className="mt-8">
              <Link
                className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-500 to-violet-500 px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-150 hover:from-brand-600 hover:to-violet-600"
                to="/products"
              >
                Continue shopping
              </Link>
            </div>
          </AppleCard>
        )
      ) : null}
    </section>
  );
}
