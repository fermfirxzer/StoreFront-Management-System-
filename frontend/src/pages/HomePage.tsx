import { useState } from "react";
import { logoutRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import AppleButton from "../components/apple/AppleButton";
import AppleCard from "../components/apple/AppleCard";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = user?.username?.trim() || user?.email || "";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutRequest();
    } finally {
      clearSession();
      setIsLoggingOut(false);
    }
  };

  return (
    <section className="animate-fade-in">
      <AppleCard className="w-full border-t-4 border-t-brand-500 p-6 shadow-[0_20px_60px_rgba(99,102,241,0.12)] sm:p-8 lg:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-600">
          Authenticated
        </p>
        <h1 className="mt-4 text-[32px] font-bold tracking-[-0.04em] text-brand-900 sm:text-[40px]">
          Welcome{user ? `, ${displayName}` : ""}.
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-apple-gray">
          Your access token lives in memory, while the refresh token stays in an HttpOnly
          cookie. A page refresh can restore your session securely.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex w-fit rounded-apple-pill border border-brand-200 bg-brand-50 px-4 py-2 text-[15px] font-semibold text-brand-700">
            Role: {user?.role ?? "Unknown"}
          </span>
          {role === "SELLER" ? (
            <AppleButton to="/seller/dashboard" variant="primary">
              Open seller dashboard
            </AppleButton>
          ) : (
            <AppleButton to="/products" variant="primary">
              Browse products
            </AppleButton>
          )}
          <AppleButton loading={isLoggingOut} onClick={handleLogout} variant="secondary">
            Logout
          </AppleButton>
        </div>
      </AppleCard>
    </section>
  );
}
