import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute() {
  const location = useLocation();
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const isAuthenticated = useAuthStore(
    (state) => state.accessToken !== null && state.user !== null
  );

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-slate-600">
        Restoring your session...
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
