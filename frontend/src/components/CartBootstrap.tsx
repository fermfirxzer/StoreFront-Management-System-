import { useEffect } from "react";
import { useCartQuery } from "../hooks/useCartQueries";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";

export default function CartBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const setCart = useCartStore((state) => state.setCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const shouldFetchCart = role === "BUYER" && Boolean(accessToken);
  const { data } = useCartQuery(shouldFetchCart);

  useEffect(() => {
    if (!shouldFetchCart) {
      clearCart();
      return;
    }

    if (data) {
      setCart(data);
    }
  }, [clearCart, data, setCart, shouldFetchCart]);

  return null;
}
