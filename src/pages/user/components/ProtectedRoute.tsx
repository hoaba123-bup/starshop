import React from "react";
import { Navigate } from "react-router-dom";
import { USER_SESSION_EXP_KEY, USER_SESSION_NOTICE_FLAG, USER_TOKEN_KEY } from "../../../constants/auth";

const isAuthed = () => {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (!token) return false;

  const expiresAt = Number(localStorage.getItem(USER_SESSION_EXP_KEY) || 0);
  if (expiresAt && Date.now() > expiresAt) {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_SESSION_EXP_KEY);
    sessionStorage.setItem(USER_SESSION_NOTICE_FLAG, "1");
    return false;
  }

  return true;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthed()) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
