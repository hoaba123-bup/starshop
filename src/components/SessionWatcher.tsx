import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ADMIN_SESSION_EXP_KEY,
  ADMIN_SESSION_NOTICE_FLAG,
  ADMIN_TOKEN_KEY,
  SESSION_DURATION_MS,
  USER_SESSION_EXP_KEY,
  USER_SESSION_NOTICE_FLAG,
  USER_TOKEN_KEY,
} from "../constants/auth";
import { useAppMessageContext } from "./ui/AppMessageProvider";

const CHECK_INTERVAL_MS = 60 * 1000;

export default function SessionWatcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const message = useAppMessageContext();

  useEffect(() => {
    const ensureExpirySeeded = () => {
      const now = Date.now();
      const userToken = localStorage.getItem(USER_TOKEN_KEY);
      const userExpiry = Number(localStorage.getItem(USER_SESSION_EXP_KEY) || 0);
      if (userToken && !userExpiry) {
        localStorage.setItem(USER_SESSION_EXP_KEY, String(now + SESSION_DURATION_MS));
      }
      if (!userToken) {
        localStorage.removeItem(USER_SESSION_EXP_KEY);
      }

      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const adminExpiry = Number(localStorage.getItem(ADMIN_SESSION_EXP_KEY) || 0);
      if (adminToken && !adminExpiry) {
        localStorage.setItem(ADMIN_SESSION_EXP_KEY, String(now + SESSION_DURATION_MS));
      }
      if (!adminToken) {
        localStorage.removeItem(ADMIN_SESSION_EXP_KEY);
      }
    };

    const checkSessions = () => {
      ensureExpirySeeded();

      const now = Date.now();
      const userToken = localStorage.getItem(USER_TOKEN_KEY);
      const userExpiry = Number(localStorage.getItem(USER_SESSION_EXP_KEY) || 0);
      if (userToken && userExpiry && now > userExpiry) {
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem(USER_SESSION_EXP_KEY);

        if (location.pathname === "/") {
          message.warning("Hết phiên đăng nhập");
        } else {
          sessionStorage.setItem(USER_SESSION_NOTICE_FLAG, "1");
        }

        if (!location.pathname.startsWith("/admin")) {
          navigate("/sign-in", { replace: true });
        }
      }

      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const adminExpiry = Number(localStorage.getItem(ADMIN_SESSION_EXP_KEY) || 0);
      if (adminToken && adminExpiry && now > adminExpiry) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_SESSION_EXP_KEY);
        if (location.pathname.startsWith("/admin")) {
          message.warning("Hết phiên đăng nhập");
        } else {
          sessionStorage.setItem(ADMIN_SESSION_NOTICE_FLAG, "1");
        }
        navigate("/admin/login", { replace: true });
      }
    };

    checkSessions();
    const intervalId = window.setInterval(checkSessions, CHECK_INTERVAL_MS);

    const handleVisibility = () => checkSessions();
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [location.pathname, message, navigate]);

  useEffect(() => {
    if (location.pathname === "/") {
      if (sessionStorage.getItem(USER_SESSION_NOTICE_FLAG)) {
        sessionStorage.removeItem(USER_SESSION_NOTICE_FLAG);
        message.warning("Hết phiên đăng nhập");
      }
    }
    if (location.pathname.startsWith("/admin")) {
      if (sessionStorage.getItem(ADMIN_SESSION_NOTICE_FLAG)) {
        sessionStorage.removeItem(ADMIN_SESSION_NOTICE_FLAG);
        message.warning("Hết phiên đăng nhập");
      }
    }
  }, [location.pathname, message]);

  return null;
}
