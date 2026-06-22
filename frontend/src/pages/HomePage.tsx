import { useState } from "react";
import { logoutRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } finally {
      clearSession();
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
        <div className="w-full rounded-[2rem] bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-blue-600">
            Authenticated
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Welcome{user ? `, ${user.email}` : ""}.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Your JWT session lives in memory only. Refreshing the page will clear
            the in-memory auth state unless we later add a refresh-cookie session.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Role: {user?.role ?? "Unknown"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
