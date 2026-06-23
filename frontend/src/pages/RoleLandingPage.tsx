import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function RoleLandingPage() {
  const role = useAuthStore((state) => state.role);

  if (role === "SELLER") {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return <Navigate to="/products" replace />;
}
