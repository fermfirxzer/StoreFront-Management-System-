import { ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";

export default function CartNavButton() {
  const cartCount = useCartStore((state) => state.itemCount);
  const { pathname } = useLocation();
  const active = pathname === "/cart";

  return (
    <Link
      aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
      className={[
        "relative inline-flex items-center rounded-full px-3 py-1.5 text-white/80 transition-all duration-150",
        active ? "bg-white/25 text-white" : "hover:bg-white/15 hover:text-white",
      ]
        .filter(Boolean)
        .join(" ")}
      to="/cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold leading-none text-[#6366F1]">
          {cartCount}
        </span>
      ) : null}
    </Link>
  );
}

