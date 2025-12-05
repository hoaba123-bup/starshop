import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthApi } from "../../../apis/auth.api";
import { SESSION_DURATION_MS, USER_SESSION_EXP_KEY, USER_SESSION_NOTICE_FLAG, USER_TOKEN_KEY } from "../../../constants/auth";

interface FormErrors {
  [key: string]: string;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form, v: string) => {
    setForm({ ...form, [k]: v });
    if (errors[k]) {
      setErrors({ ...errors, [k]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await AuthApi.signIn({
        email: form.email,
        password: form.password
      });

      const payload = response.data as any;
      const user = payload.user;
      if (user.role !== "user") {
        setErrors({ submit: "Tài khoản quản trị vui lòng dùng /admin" });
        setLoading(false);
        return;
      }

      localStorage.setItem(USER_TOKEN_KEY, payload.token);
      localStorage.setItem(USER_SESSION_EXP_KEY, String(Date.now() + SESSION_DURATION_MS));
      sessionStorage.removeItem(USER_SESSION_NOTICE_FLAG);
      navigate("/");
    } catch (error: any) {
      console.error('SignIn error:', error);
      if (error.response?.data?.errors) {
        const errorMap: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
      } else {
        setErrors({ submit: error.response?.data?.error || "Lỗi không xác định" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-800 text-center">Đăng nhập</h1>
          <p className="text-center text-sm text-slate-600 mt-2">
            Đăng nhập để tiếp tục mua sắm
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  errors.email
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                } focus:outline-none`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  errors.password
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                } focus:outline-none`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ✗ {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Chưa có tài khoản?{" "}
            <Link to="/sign-up" className="text-indigo-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}




