import React, { useEffect, useState } from "react";
import { AdminApi } from "../../apis/admin.api";
import { Order } from "../../types/order";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-200 text-slate-600",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState({ status: "all", q: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = { q: filters.q || undefined };
      if (filters.status !== "all") params.status = filters.status;
      const res = await AdminApi.orders.list(params);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Khong tai duoc danh sach don hang.");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (order: Order) => {
    try {
      const res = await AdminApi.orders.detail(order.id);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (order: Order, status: string) => {
    if (order.status === status) return;
    setUpdating(true);
    try {
      const res = await AdminApi.orders.updateStatus(order.id, status);
      const updated = res.data;
      setOrders((prev) =>
        prev.map((item) => (String(item.id) === String(order.id) ? updated : item))
      );
      if (selected && String(selected.id) === String(order.id)) {
        setSelected(updated);
      }
    } catch (err) {
      console.error(err);
      alert("Khong cap nhat duoc trang thai.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quan ly don hang</h1>
        <p className="text-sm text-slate-600 mt-1">
          Theo doi trang thai va duyet don theo thoi gian thuc
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Tim ma don, ten khach, email..."
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        >
          <option value="all">Tat ca</option>
          <option value="pending">Cho duyet</option>
          <option value="approved">Da duyet</option>
          <option value="cancelled">Da huy</option>
        </select>
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
              <th className="py-3 px-4 font-semibold text-slate-600">Ma don</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Khach hang</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Tong tien</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Trang thai</th>
              <th className="py-3 px-4 font-semibold text-slate-600">Ngay tao</th>
              <th className="py-3 px-4 font-semibold text-slate-600 text-center">Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Dang tai...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Khong co don hang phu hop.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{order.code}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {order.customerName || order.accountName || "Khach le"}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {Number(order.totalAmount).toLocaleString("vi-VN")} VND
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        statusBadge[order.status] || "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("vi-VN")
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        className="text-indigo-600 text-xs font-semibold hover:underline"
                        onClick={() => openDetail(order)}
                      >
                        Xem
                      </button>
                      <button
                        className="text-emerald-600 text-xs font-semibold hover:underline disabled:text-slate-400"
                        disabled={order.status === "approved" || updating}
                        onClick={() => updateStatus(order, "approved")}
                      >
                        Duyet
                      </button>
                      <button
                        className="text-rose-600 text-xs font-semibold hover:underline disabled:text-slate-400"
                        disabled={order.status === "cancelled" || updating}
                        onClick={() => updateStatus(order, "cancelled")}
                      >
                        Huy
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Chi tiet don {selected.code}
                </h2>
                <p className="text-sm text-slate-500">
                  Khach: {selected.customerName} - {selected.customerPhone}
                </p>
              </div>
              <button
                className="text-slate-500 hover:text-rose-600"
                onClick={() => setSelected(null)}
              >
                X
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">San pham</h3>
              <div className="space-y-2 text-sm">
                {selected.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-slate-600"
                  >
                    <span>
                      {item.productName || item.productId} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {Number(item.price * item.quantity).toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-200 pt-3 flex justify-between text-sm font-semibold">
                <span>Tong cong</span>
                <span className="text-indigo-600">
                  {Number(selected.totalAmount).toLocaleString("vi-VN")} VND
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-700">Thong tin khach</p>
                <p>{selected.customerName}</p>
                <p>{selected.customerEmail}</p>
                <p>{selected.shippingAddress}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Phuong thuc</p>
                <p>Thanh toan: {selected.paymentMethod}</p>
                <p>Trang thai: {selected.status}</p>
                <p>
                  Ngay tao: {selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString("vi-VN")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                onClick={() => setSelected(null)}
              >
                Dong
              </button>
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400"
                disabled={selected.status === "approved" || updating}
                onClick={() => updateStatus(selected, "approved")}
              >
                Duyet don
              </button>
              <button
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400"
                disabled={selected.status === "cancelled" || updating}
                onClick={() => updateStatus(selected, "cancelled")}
              >
                Huy don
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
