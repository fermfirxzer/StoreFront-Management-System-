import { Navigate, Route, Routes } from "react-router-dom";
import AuthBootstrap from "./components/AuthBootstrap";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateProductPage from "./pages/seller/CreateProductPage";
import EditProductPage from "./pages/seller/EditProductPage";
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleGuard from "./routes/RoleGuard";

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<RoleGuard allowedRole="SELLER" />}>
            <Route path="/seller" element={<SellerDashboardPage />} />
            <Route path="/seller/products/new" element={<CreateProductPage />} />
            <Route path="/seller/products/:productId/edit" element={<EditProductPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
