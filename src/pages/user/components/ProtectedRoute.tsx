import React from "react";
import { Navigate } from "react-router-dom";

const isAuthed = () => !!localStorage.getItem("token");

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthed()) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
