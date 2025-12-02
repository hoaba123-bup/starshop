import { Navigate, useLocation } from "react-router-dom";

const hasAdminAccess = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin" || payload.role === "staff";
  } catch {
    return false;
  }
};

const AdminProtected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  if (!hasAdminAccess()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default AdminProtected;
