import { useCallback, useEffect } from "react";

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



const CHECK_INTERVAL_MS = 10 * 1000;

const USER_PUBLIC_PATHS = new Set(["/sign-in", "/sign-up"]);

const USER_NOTICE_PATHS = new Set(["/", "/sign-in"]);

const ADMIN_PUBLIC_PATHS = new Set(["/admin", "/admin/", "/admin/login"]);

const ADMIN_NOTICE_PATHS = new Set(["/admin", "/admin/login"]);

const WATCHED_STORAGE_KEYS = new Set([

  USER_TOKEN_KEY,

  USER_SESSION_EXP_KEY,

  ADMIN_TOKEN_KEY,

  ADMIN_SESSION_EXP_KEY,

]);



export default function SessionWatcher() {

  const location = useLocation();

  const navigate = useNavigate();

  const message = useAppMessageContext();



  const checkSessions = useCallback(() => {

    const now = Date.now();

    const onAdminRoute = location.pathname.startsWith("/admin");

    const onUserArea = !onAdminRoute && !USER_PUBLIC_PATHS.has(location.pathname);

    const onAdminArea = onAdminRoute && !ADMIN_PUBLIC_PATHS.has(location.pathname);



    const ensureSeeded = (tokenKey: string, expKey: string) => {

      const token = localStorage.getItem(tokenKey);

      let expiry = Number(localStorage.getItem(expKey) || 0);

      if (token && !expiry) {

        expiry = now + SESSION_DURATION_MS;

        localStorage.setItem(expKey, String(expiry));

      }

      if (!token && expiry) {

        localStorage.removeItem(expKey);

        expiry = 0;

      }

      return { token, expiry };

    };



    const { token: userToken, expiry: userExpiry } = ensureSeeded(USER_TOKEN_KEY, USER_SESSION_EXP_KEY);

    const { token: adminToken, expiry: adminExpiry } = ensureSeeded(ADMIN_TOKEN_KEY, ADMIN_SESSION_EXP_KEY);



    const queueUserNotice = () => sessionStorage.setItem(USER_SESSION_NOTICE_FLAG, "1");

    const queueAdminNotice = () => sessionStorage.setItem(ADMIN_SESSION_NOTICE_FLAG, "1");



    if (userToken && userExpiry && now > userExpiry) {

      localStorage.removeItem(USER_TOKEN_KEY);

      localStorage.removeItem(USER_SESSION_EXP_KEY);

      if (onUserArea) {

        sessionStorage.removeItem(USER_SESSION_NOTICE_FLAG);

        message.warning("Hết phiên đăng nhập");

        navigate("/sign-in", { replace: true });

      } else {

        queueUserNotice();

      }

    } else if (!userToken && onUserArea) {

      localStorage.removeItem(USER_SESSION_EXP_KEY);

      sessionStorage.removeItem(USER_SESSION_NOTICE_FLAG);

      message.warning("Hết phiên đăng nhập");

      navigate("/sign-in", { replace: true });

    }



    if (adminToken && adminExpiry && now > adminExpiry) {

      localStorage.removeItem(ADMIN_TOKEN_KEY);

      localStorage.removeItem(ADMIN_SESSION_EXP_KEY);

      if (onAdminArea) {

        sessionStorage.removeItem(ADMIN_SESSION_NOTICE_FLAG);

        message.warning("Hết phiên đăng nhập");

        navigate("/admin/login", { replace: true });

      } else {

        queueAdminNotice();

      }

    } else if (!adminToken && onAdminArea) {

      localStorage.removeItem(ADMIN_SESSION_EXP_KEY);

      sessionStorage.removeItem(ADMIN_SESSION_NOTICE_FLAG);

      message.warning("Hết phiên đăng nhập");

      navigate("/admin/login", { replace: true });

    }

  }, [location.pathname, message, navigate]);



  useEffect(() => {

    checkSessions();

    const intervalId = window.setInterval(checkSessions, CHECK_INTERVAL_MS);



    const handleVisibility = () => checkSessions();

    const handleStorage = (event: StorageEvent) => {

      if (!event.key || WATCHED_STORAGE_KEYS.has(event.key)) {

        checkSessions();

      }

    };



    window.addEventListener("focus", handleVisibility);

    document.addEventListener("visibilitychange", handleVisibility);

    window.addEventListener("storage", handleStorage);



    return () => {

      clearInterval(intervalId);

      window.removeEventListener("focus", handleVisibility);

      document.removeEventListener("visibilitychange", handleVisibility);

      window.removeEventListener("storage", handleStorage);

    };

  }, [checkSessions]);



  useEffect(() => {

    if (USER_NOTICE_PATHS.has(location.pathname)) {

      if (sessionStorage.getItem(USER_SESSION_NOTICE_FLAG)) {

        sessionStorage.removeItem(USER_SESSION_NOTICE_FLAG);

        message.warning("Hết phiên đăng nhập");

      }

    }

    if (ADMIN_NOTICE_PATHS.has(location.pathname)) {

      if (sessionStorage.getItem(ADMIN_SESSION_NOTICE_FLAG)) {

        sessionStorage.removeItem(ADMIN_SESSION_NOTICE_FLAG);

        message.warning("Hết phiên đăng nhập");

      }

    }

  }, [location.pathname, message]);



  return null;

}

