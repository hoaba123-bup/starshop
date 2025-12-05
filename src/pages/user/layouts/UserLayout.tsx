import { Outlet, Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../../../components/ThemeToggle";
import { USER_SESSION_EXP_KEY, USER_SESSION_NOTICE_FLAG, USER_TOKEN_KEY } from "../../../constants/auth";

const navLink = "text-sm font-medium text-white hover:text-white/80 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all";

export default function UserLayout() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem(USER_TOKEN_KEY);

  const handleLogout = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_SESSION_EXP_KEY);
    sessionStorage.removeItem(USER_SESSION_NOTICE_FLAG);
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-[#432DD7] text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold text-white">StarShop</Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className={navLink}>Trang chủ</Link>
            <Link to="/cart" className={navLink}>Giỏ hàng</Link>
            <Link to="/profile/orders" className={navLink}>Đơn hàng</Link>
            <Link to="/profile" className={navLink}>Cá nhân</Link>
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={navLink + " bg-none border-none cursor-pointer"}
              >
                Đăng xuất
              </button>
            ) : (
              <Link to="/sign-in" className={navLink}>Sign In</Link>
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

