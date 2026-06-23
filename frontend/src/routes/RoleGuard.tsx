import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { UserRole } from "../types/auth";

interface RoleGuardProps {
  allowedRole: UserRole;
}

export default function RoleGuard({ allowedRole }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);
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
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
