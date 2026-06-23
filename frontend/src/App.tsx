import { Navigate, Route, Routes } from "react-router-dom";
import AuthBootstrap from "./components/AuthBootstrap";
import Layout from "./components/layout/Layout";
import BrowseProductsPage from "./pages/BrowseProductsPage";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
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
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/products" element={<Layout><BrowseProductsPage /></Layout>} />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />
          <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
          <Route element={<RoleGuard allowedRole="SELLER" />}>
            <Route path="/seller/dashboard" element={<Layout><SellerDashboardPage /></Layout>} />
            <Route path="/seller/products/create" element={<Layout><CreateProductPage /></Layout>} />
            <Route path="/seller/products/:productId/edit" element={<Layout><EditProductPage /></Layout>} />
            <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="/seller/products/new" element={<Navigate to="/seller/products/create" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
