import { Navigate, useLocation } from "react-router-dom";
import {
  ADMIN_SESSION_EXP_KEY,
  ADMIN_SESSION_NOTICE_FLAG,
  ADMIN_TOKEN_KEY,
} from "../../../constants/auth";

const AdminProtected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const expiresAt = Number(localStorage.getItem(ADMIN_SESSION_EXP_KEY) || 0);
  if (expiresAt && Date.now() > expiresAt) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_SESSION_EXP_KEY);
    sessionStorage.setItem(ADMIN_SESSION_NOTICE_FLAG, "1");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role === "admin" || payload.role === "staff") {
      return <>{children}</>;
    }
  } catch {
    // ignore
  }

  return <Navigate to="/admin/login" state={{ from: location }} replace />;
};

export default AdminProtected;
