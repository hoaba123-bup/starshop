import React, { useEffect, useMemo, useState } from "react";
import { AdminApi } from "../../apis/admin.api";
import { ADMIN_TOKEN_KEY } from "../../constants/auth";
import { User } from "../../types/user";
import { useAppMessage } from "../../hooks/useAppMessage";

const getRoleFromToken = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return "user";
  try {
    return JSON.parse(atob(token.split(".")[1])).role || "user";
  } catch {
    return "user";
  }
};

export default function Customers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ q: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const role = useMemo(() => getRoleFromToken(), []);
  const canUpdateRole = role === "admin";

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = filters.q ? { q: filters.q } : undefined;
      const res = await AdminApi.customers(params);
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  const notify = useAppMessage();

  const toggleRole = async (user: User) => {
    const nextRole = user.role === "staff" ? "user" : "staff";
    setUpdatingId(user.id);
    try {
      const res = await AdminApi.updateUserRole(user.id, nextRole);
      const updated = res.data;
      setCustomers((prev) =>
        prev.map((item) => (String(item.id) === String(user.id) ? updated : item))
      );
    } catch (err) {
      console.error(err);
      notify.error("Không cập nhật được quyền.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Khách hàng & nhân viên</h1>
        <p className="text-sm text-slate-600 mt-1">
          Quản lý thông tin và phân quyền người dùng
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Tìm theo tên..."
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="py-3 px-4 font-semibold text-slate-600">Khách hàng</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Liên hệ</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Quyền</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Đơn hàng</th>
              <th className="py-3 px-4 font-semibold text-slate-600 text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {customer.fullName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <p>{customer.email}</p>
                    <p>{customer.phone || "Chưa cập nhật"}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        customer.role === "staff"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {customer.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {customer.totalOrders ?? 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {canUpdateRole ? (
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
                        disabled={updatingId === customer.id}
                        onClick={() => toggleRole(customer)}
                      >
                        {customer.role === "staff" ? "Chuyển về user" : "Nâng thành staff"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Chỉ xem</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}





