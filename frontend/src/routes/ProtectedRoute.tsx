import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute() {
  const location = useLocation();
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const isAuthenticated = useAuthStore(
    (state) => Boolean(state.accessToken) && state.user !== null
  );

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
        Restoring your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
