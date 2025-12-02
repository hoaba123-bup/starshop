import { Routes, Route, Navigate } from "react-router-dom";

// User area
import UserLayout from "./pages/user/layouts/UserLayout";
import Home from "./pages/user/Home";
import ProductDetail from "./pages/user/ProductDetail";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import SignIn from "./pages/user/auth/SignIn";
import SignUp from "./pages/user/auth/SignUp";
import Profile from "./pages/user/profile/Profile";
import UserOrders from "./pages/user/profile/Orders";
import ProtectedRoute from "./pages/user/components/ProtectedRoute";

// Admin area
import AdminLayout from "./pages/admin/layouts/AdminLayout";
import AdminLogin from "./pages/admin/auth/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminProtected from "./pages/admin/components/AdminProtected";

export default function RouterSetup() {
  return (
    <Routes>
      {/* User */}
      <Route path="/" element={<UserLayout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="product/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/orders"
          element={
            <ProtectedRoute>
              <UserOrders />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Public Auth */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtected>
            <AdminLayout />
          </AdminProtected>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
