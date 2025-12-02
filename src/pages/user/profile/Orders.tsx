import React, { useEffect, useState } from "react";
import { Order } from "../../../types/order";
import { OrderApi } from "../../../apis/order.api";

const statusLabel: Record<string, string> = {
  pending: "Cho xu ly",
  approved: "Da giao",
  cancelled: "Da huy",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await OrderApi.myOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Khong tai duoc lich su don hang.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Don hang cua toi</h1>
        <p className="text-sm text-slate-600 mt-1">Theo doi trang thai va chi tiet don</p>
      </div>
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Ma don</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Ngay dat</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Tong tien</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Trang thai</th>
              <th className="text-center py-3 px-4 font-semibold text-slate-700">Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Dang tai...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Ban chua co don hang nao.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="border-b border-slate-100 hover:bg-[#432DD7]/15 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{order.code}</td>
                    <td className="py-3 px-4">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {Number(order.totalAmount).toLocaleString("vi-VN")} VND
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        className="text-indigo-600 text-xs font-semibold hover:underline"
                        onClick={() =>
                          setExpanded((prev) => (prev === order.id ? null : order.id))
                        }
                      >
                        {expanded === order.id ? "Thu gon" : "Chi tiet"}
                      </button>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr className="bg-[#432DD7]/10">
                      <td colSpan={5} className="px-4 pb-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          <p className="font-semibold text-slate-800 mb-2">San pham</p>
                          <ul className="space-y-1">
                            {order.items?.map((item) => (
                              <li key={item.id} className="flex justify-between">
                                <span>
                                  {item.productName || item.productId} x {item.quantity}
                                </span>
                                <span className="font-medium">
                                  {Number(item.price * item.quantity).toLocaleString("vi-VN")} VND
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 border-t border-slate-200 pt-3">
                            <p>Dia chi giao: {order.shippingAddress || "-"}</p>
                            <p>Phuong thuc: {order.paymentMethod}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
