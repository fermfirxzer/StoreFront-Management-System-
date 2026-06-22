import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { UserRole } from "../types/auth";

interface RoleGuardProps {
  allowedRole: UserRole;
}

export default function RoleGuard({ allowedRole }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore(
    (state) => state.accessToken !== null && state.user !== null
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

