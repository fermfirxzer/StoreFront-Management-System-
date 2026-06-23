import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { removeCartItem, updateCartItemQuantity } from "../../api/cartApi";
import productPlaceholder from "../../assets/product-placeholder.svg";
import AppleButton from "../apple/AppleButton";
import { useCartStore } from "../../stores/cartStore";
import type { Cart } from "../../types/cart";

const thaiCurrencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

export default function CartNavButton() {
  const queryClient = useQueryClient();
  const cart = useCartStore((state) => state.cart);
  const cartCount = useCartStore((state) => state.itemCount);
  const setCart = useCartStore((state) => state.setCart);
  const optimisticUpdateItem = useCartStore((state) => state.optimisticUpdateItem);
  const optimisticRemoveItem = useCartStore((state) => state.optimisticRemoveItem);
  const { pathname } = useLocation();
  const active = pathname === "/cart";
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div
      className="relative hidden shrink-0 md:block"
      onMouseEnter={() => {
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        setIsOpen(false);
      }}
    >
      <Link
        aria-expanded={isOpen}
        aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
        className={[
          "relative inline-flex items-center rounded-full px-3 py-1.5 text-white/80 transition-all duration-150",
          active ? "bg-white/25 text-white" : "hover:bg-white/15 hover:text-white",
        ]
          .filter(Boolean)
          .join(" ")}
        onFocus={() => {
          setIsOpen(true);
        }}
        to="/cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold leading-none text-[#6366F1]">
            {cartCount}
          </span>
        ) : null}
      </Link>

      <div
        className={[
          "absolute right-0 top-full z-50 mt-3 w-[360px] max-w-[calc(100vw-1.5rem)] origin-top-right rounded-[24px] border border-white/20 bg-white p-4 text-[#1E1B4B] shadow-[0_24px_60px_rgba(15,23,42,0.2)] backdrop-blur-sm",
          isOpen ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-1",
          "transition-all duration-200 ease-apple",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
              Cart
            </p>
            <p className="mt-1 text-[14px] text-apple-gray">
              {cartCount} item{cartCount === 1 ? "" : "s"}
            </p>
          </div>
          <AppleButton
            className="px-4 py-2 text-[14px]"
            to="/cart"
            variant="secondary"
          >
            View cart
          </AppleButton>
        </div>

        {cart && cart.items.length > 0 ? (
          <>
            <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-apple-card bg-[#F8FAFF] p-3"
                >
                  <Link
                    className="flex min-w-0 flex-1 items-center gap-3"
                    to={`/products/${item.product.id}`}
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-[#EEF2FF]">
                      <img
                        alt={item.product.title}
                        className="h-full w-full object-cover"
                        src={item.product.image ?? productPlaceholder}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[14px] font-semibold text-brand-900">
                        {item.product.title}
                      </p>
                      <p className="mt-1 text-[12px] text-apple-gray">
                        {thaiCurrencyFormatter.format(item.product.unitPrice)}
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-[#4338CA]">
                        {thaiCurrencyFormatter.format(item.lineTotal)}
                      </p>
                    </div>
                  </Link>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-1 rounded-apple-pill bg-white p-1">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-apple-gray transition hover:bg-[#EEF2FF] hover:text-brand-900 disabled:cursor-not-allowed disabled:text-[#B3B3BD]"
                        disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void updateQuantityMutation.mutateAsync({
                            itemId: item.id,
                            quantity: item.quantity - 1,
                          });
                        }}
                        type="button"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-[13px] font-semibold text-brand-900">
                        {item.quantity}
                      </span>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-apple-gray transition hover:bg-[#EEF2FF] hover:text-brand-900 disabled:cursor-not-allowed disabled:text-[#B3B3BD]"
                        disabled={
                          item.quantity >= item.product.availableQuantity || updateQuantityMutation.isPending
                        }
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void updateQuantityMutation.mutateAsync({
                            itemId: item.id,
                            quantity: item.quantity + 1,
                          });
                        }}
                        type="button"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      className="inline-flex items-center gap-1 rounded-apple-pill px-2 py-1 text-[12px] font-semibold text-[#FF3B30] transition hover:bg-[#FFF1F0] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={removeItemMutation.isPending}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void removeItemMutation.mutateAsync(item.id);
                      }}
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
              <p className="text-[14px] text-apple-gray">Subtotal</p>
              <p className="text-[16px] font-semibold text-brand-900">
                {thaiCurrencyFormatter.format(cart.subtotal)}
              </p>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-apple-card bg-[#F8FAFF] p-4 text-center">
            <p className="text-[14px] text-apple-gray">Your cart is empty.</p>
            <div className="mt-3">
              <AppleButton
                className="px-4 py-2 text-[14px]"
                to="/products"
                variant="ghost"
              >
                Browse products
              </AppleButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
