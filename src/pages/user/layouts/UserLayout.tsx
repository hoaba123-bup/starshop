import { Outlet, Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../../../components/ThemeToggle";
import React from 'react';
import '../../user/css/MinimalistMenu.css';

const navLink = "text-sm font-medium text-white hover:text-white/80 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all";

export default function UserLayout() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-[#432DD7] text-white">
  <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
  <Link to="/" className="flex items-center image-logo"> 
      <img 
        src="/public/logo-starshop-Photoroom.png" // <<< THAY ĐỔI ĐƯỜNG DẪN NÀY
        alt="StarShop Logo" 
        className="h-8 w-auto" // Đặt chiều cao 8 units (khoảng 32px), w-auto giữ tỷ lệ
      />
    </Link>
    <nav className="flex items-center gap-4">
      {/* Sử dụng div với class "menu" để áp dụng các style link mới, 
        nhưng override màu nền, padding, và border để giữ màu nền header.
      */}
      <div className="menu !bg-transparent !p-0 !shadow-none !border-none !backdrop-filter-none !gap-2">
        
        {/* Link: Home */}
        <Link to="/" className="link" aria-label="Home">
          <span className="link-icon material-symbols-rounded">home</span>
          <span className="link-title">Home</span>
        </Link>
        
        {/* Link: Cart */}
        <Link to="/cart" className="link" aria-label="Cart">
          <span className="link-icon material-symbols-rounded">shopping_cart</span>
          <span className="link-title">Cart</span>
        </Link>
        
        {/* Link: Orders */}
        <Link to="/profile/orders" className="link" aria-label="Orders">
          <span className="link-icon material-symbols-rounded">receipt_long</span>
          <span className="link-title">Orders</span>
        </Link>
        
        {/* Link: Profile */}
        <Link to="/profile" className="link" aria-label="Profile">
          <span className="link-icon material-symbols-rounded">account_circle</span>
          <span className="link-title">Profile</span>
        </Link>
      </div>
      
      {/* Theme Toggle (Giữ nguyên vị trí) */}
      <ThemeToggle />
      
      {/* Logic Đăng nhập/Đăng xuất (Giữ nguyên) */}
      {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="link" // Áp dụng style link
            aria-label="Sign Out"
          >
            <span className="link-icon material-symbols-rounded">logout</span>
            <span className="link-title">Sign Out</span>
          </button>
        ) : (
          <Link to="/sign-in" className="link" aria-label="Sign In">
            <span className="link-icon material-symbols-rounded">login</span>
            <span className="link-title">Sign In</span>
          </Link>
        )}
    </nav>
  </div>
</header>

      <main className="mx-auto max-w-6xl px-4 py-6 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-[#432DD7] text-white py-4 text-center text-sm">
        &copy; {new Date().getFullYear()} StarShop. All rights reserved.
      </footer>
      
    </div>
  );
}
