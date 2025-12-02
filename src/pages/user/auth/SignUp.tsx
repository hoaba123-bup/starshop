import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthApi } from "../../../apis/auth.api";

interface FormErrors {
  [key: string]: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("");

    try {
      const response = await AuthApi.signUp({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });

      localStorage.setItem("token", (response.data as any).token);
      setSuccessMessage("Đăng ký thành công! Đang chuyển hướng...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error('SignUp error:', error);
      if (error.response?.data?.errors) {
        const errorMap: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
      } else if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else if (error.message) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: "Lỗi không xác định" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-800 text-center">Đăng ký</h1>
          <p className="text-center text-sm text-slate-600 mt-2">
            Tạo tài khoản mới để bắt đầu mua sắm
          </p>

          {successMessage && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  errors.fullName
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                } focus:outline-none`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

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
              <p className="mt-2 text-xs text-slate-500">
                • Ít nhất 6 ký tự<br />
                • Chứa chữ hoa, chữ thường, và số
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  errors.confirmPassword
                    ? "border-red-300 bg-red-50 focus:border-red-500"
                    : "border-slate-300 focus:border-indigo-600 focus:bg-white"
                } focus:outline-none`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
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
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Đã có tài khoản?{" "}
            <Link to="/sign-in" className="text-indigo-600 font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
