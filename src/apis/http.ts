import axios from "axios";

const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export const http = axios.create({
  baseURL: base,
  withCredentials: true,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/sign-in";
    }
    return Promise.reject(err);
  }
);
