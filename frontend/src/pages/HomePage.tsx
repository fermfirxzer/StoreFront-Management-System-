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
    <main className="apple-surface min-h-screen text-apple-black animate-fade-in">
      <section className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6">
        <AppleCard className="w-full p-6 sm:p-8 lg:p-10 shadow-apple-modal">
          <p className="text-[13px] font-medium uppercase tracking-[0.2px] text-apple-gray">
            Authenticated
          </p>
          <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.04em] sm:text-[40px]">
            Welcome{user ? `, ${user.email}` : ""}.
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-7 text-apple-gray">
            Your access token lives in memory, while the refresh token stays in
            an HttpOnly cookie. A page refresh can restore your session securely.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="inline-flex w-fit rounded-apple-pill bg-apple-gray-light px-4 py-2 text-[15px] font-medium text-apple-black">
              Role: {user?.role ?? "Unknown"}
            </span>
            {role === "SELLER" ? (
              <AppleButton to="/seller" variant="primary">
                Open seller dashboard
              </AppleButton>
            ) : null}
            <AppleButton
              loading={isLoggingOut}
              onClick={handleLogout}
              variant="secondary"
            >
              Logout
            </AppleButton>
          </div>
        </AppleCard>
      </section>
    </main>
  );
}
