import { ADMIN_SESSION_EXP_KEY, ADMIN_TOKEN_KEY } from "../../../constants/auth";
import { Outlet, Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../../../components/ThemeToggle";
import { useAppMessageContext } from "../../../components/ui/AppMessageProvider";

const navLink =
  "text-sm font-medium text-white hover:text-white/80 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all";

export default function AdminLayout() {
  const navigate = useNavigate();
  const message = useAppMessageContext();

  const handleSignOut = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_SESSION_EXP_KEY);
    message.warning("Hết phiên đăng nhập");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-40 bg-[#432DD7] text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-semibold text-white">StarShop Admin</span>
          <nav className="flex items-center gap-4">
            <Link to="/admin/dashboard" className={navLink}>
              Tổng quan
            </Link>
            <Link to="/admin/dashboard/products" className={navLink}>
              Sản phẩm
            </Link>
            <Link to="/admin/dashboard/orders" className={navLink}>
              Đơn hàng
            </Link>
            <Link to="/admin/dashboard/customers" className={navLink}>
              Khách hàng
            </Link>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold text-white hover:text-white/80 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white hover:after:w-full after:transition-all transition-colors hover:cursor-pointer"
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>
      <main className="pt-14 px-4 pb-10 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
