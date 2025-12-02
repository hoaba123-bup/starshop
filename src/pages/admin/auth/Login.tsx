import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../../apis/http";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const decodeRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (decodeRole() === "admin") {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const result: FormErrors = {};
    const trimmedEmail = form.email.trim();
    const trimmedPassword = form.password.trim();

    if (!trimmedEmail) {
      result.email = "Email khong duoc de trong";
    } else if (!emailRegex.test(trimmedEmail)) {
      result.email = "Email khong hop le";
    }

    if (!trimmedPassword) {
      result.password = "Mat khau khong duoc de trong";
    } else if (trimmedPassword.length < 6) {
      result.password = "Mat khau toi thieu 6 ky tu";
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    const localErrors = validate();
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      const response = await http.post("/admin/login", {
        email: form.email.trim(),
        password: form.password.trim(),
      });

      localStorage.setItem("token", response.data.token);
      setStatus("Dang nhap thanh cong");
      setTimeout(() => navigate("/admin/dashboard"), 600);
    } catch (error: any) {
      console.error("Admin login error:", error);
      if (error.response?.data?.errors) {
        const apiErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field && err.message) {
            apiErrors[err.field as keyof FormErrors] = err.message;
          }
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: error.response?.data?.error || "Loi khong xac dinh" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 text-center">Admin Portal</h1>
        <p className="text-center text-sm text-slate-500 mt-1">Chi danh cho tai khoan quan tri</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mat khau</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              placeholder="Nhap mat khau"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          {errors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.submit}
            </div>
          )}
          {status && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 text-white font-semibold hover:bg-indigo-700 disabled:bg-slate-400"
          >
            {loading ? "Dang dang nhap..." : "Dang nhap"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">Duong dan bi mat: /admin hoac /admin/login</p>
      </div>
    </div>
  );
}
