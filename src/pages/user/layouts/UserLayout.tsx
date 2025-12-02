import { Outlet, Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../../../components/ThemeToggle";

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
          <Link to="/" className="text-lg font-semibold text-white">StarShop</Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className={navLink}>Home</Link>
            <Link to="/cart" className={navLink}>Cart</Link>
            <Link to="/profile/orders" className={navLink}>Orders</Link>
            <Link to="/profile" className={navLink}>Profile</Link>
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={navLink + " bg-none border-none cursor-pointer"}
              >
                Sign Out
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
