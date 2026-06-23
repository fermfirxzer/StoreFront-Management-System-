import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { logoutRequest } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";
import NavLink from "./NavLink";
import CartNavButton from "./CartNavButton";
import UserMenu from "./UserMenu";

interface NavbarProps {
  containerClass: string;
}

export default function Navbar({ containerClass }: NavbarProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const displayName = user?.username?.trim() || user?.email || "";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
      closeMobileMenu();
    }
  };

  const navItems =
    role === "SELLER"
      ? [
          <NavLink key="seller-dashboard" to="/seller/dashboard" onClick={closeMobileMenu}>
            My Products
          </NavLink>,
          <NavLink key="seller-create" to="/seller/products/create" onClick={closeMobileMenu}>
            + Add Product
          </NavLink>,
        ]
      : role === "BUYER"
        ? [
            <NavLink key="browse" to="/products" onClick={closeMobileMenu}>
              Browse
            </NavLink>,
            <div key="cart">
              <CartNavButton />
            </div>,
          ]
        : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-[0_2px_16px_rgba(99,102,241,0.35)] backdrop-blur-sm">
      <div className={`${containerClass} flex h-16 items-center justify-between gap-3`}>
        <Link className="flex items-center gap-2" to="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-white">
            Market<span className="text-white/70">place</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">{navItems}</div>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/login" onClick={closeMobileMenu}>
                Login
              </NavLink>
              <Link
                className="rounded-full bg-white px-4 py-1.5 text-[14px] font-semibold text-[#6366F1] transition-colors duration-150 hover:bg-white/90"
                to="/register"
              >
                Register
              </Link>
            </div>
          )}

          <button
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors duration-150 hover:bg-white/25 md:hidden"
            onClick={() => {
              setIsMobileMenuOpen((value) => !value);
            }}
            type="button"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={[
          "border-t border-white/10 bg-[#5B52E6]/95 px-4 pb-4 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-all duration-200 md:hidden",
          isMobileMenuOpen
            ? "max-h-[28rem] opacity-100"
            : "pointer-events-none max-h-0 overflow-hidden opacity-0",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={`${containerClass} flex flex-col gap-2`}>
          {navItems.length > 0 ? <div className="flex flex-wrap gap-2">{navItems}</div> : null}

          {!user ? (
            <div className="flex flex-col gap-2 pt-1">
              <NavLink to="/login" onClick={closeMobileMenu}>
                Login
              </NavLink>
              <Link
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-[#6366F1] transition-colors duration-150 hover:bg-white/90"
                onClick={closeMobileMenu}
                to="/register"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/10 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-semibold">{displayName}</p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-white/10"
                onClick={() => {
                  void handleLogout();
                }}
                type="button"
              >
                Sign out
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
