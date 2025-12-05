import axios from "axios";
import { ADMIN_TOKEN_KEY, USER_TOKEN_KEY } from "../constants/auth";

const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function createHttpClient(tokenKey: string, redirectPath: string) {
  const instance = axios.create({
    baseURL: base,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem(tokenKey);
        if (typeof window !== "undefined") {
          const current = window.location.pathname;
          if (!current.startsWith(redirectPath)) {
            window.location.href = redirectPath;
          }
        }
      }
      return Promise.reject(err);
    }
  );

  return instance;
}

export const http = createHttpClient(USER_TOKEN_KEY, "/sign-in");
export const httpAdmin = createHttpClient(ADMIN_TOKEN_KEY, "/admin/login");
