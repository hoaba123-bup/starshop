import React, { useEffect, useState } from "react";
import { Order } from "../../../types/order";
import { OrderApi } from "../../../apis/order.api";
// file: src/pages/user/Orders.tsx

// Khai báo nhãn trạng thái tiếng Việt
const statusLabel: Record<string, string> = {
    pending: "Chờ xử lý", // Nếu Backend trả về 'pending'
    approved: "Đã duyệt", // Nếu Backend trả về 'approved'
    cancelled: "Đã hủy",
    // Vui lòng thêm các trạng thái khác nếu Backend có:
    // processing: "Đang xử lý",
    // delivered: "Đã giao hàng", 
    // paid: "Đã thanh toán",
};

// Hàm tiện ích để xác định nhãn và class CSS
const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
        case "pending": 
        case "awaiting_payment":
            return {
                label: statusLabel["pending"], // "Chờ xử lý"
                classes: "bg-yellow-100 text-yellow-800 border border-yellow-300",
            };
        case "approved": // ⬅️ Trạng thái này phải khớp với trạng thái Admin đã duyệt
        case "paid":
            return {
                label: statusLabel["approved"], // "Đã duyệt"
                classes: "bg-indigo-100 text-indigo-800 border border-indigo-300",
            };
        case "cancelled": 
            return {
                label: statusLabel["cancelled"], // "Đã hủy"
                classes: "bg-red-100 text-red-800 border border-red-300",
            };
        // Thêm case cho các trạng thái khác nếu có (ví dụ: processing, delivered)
        case "delivered":
            return {
                label: statusLabel["delivered"] || "Đã giao",
                classes: "bg-green-100 text-green-800 border border-green-300",
            };
        default:
            return {
                // Rất quan trọng: Nếu vẫn lỗi, hãy hiển thị giá trị status gốc để debug
                label: status, 
                classes: "bg-slate-100 text-slate-600 border border-slate-300",
            };
    }
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
      setError("Không tải được lịch sử đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Đơn hàng của tôi</h1>
        <p className="text-sm text-slate-600 mt-1">Theo dõi trạng thái và chi tiết đơn</p>
      </div>
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
    
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        {/* ... (Header bảng) ... */}
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Mã đơn</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Ngày đặt</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Tổng tiền</th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-500">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-500">
                                    Bạn chưa có đơn hàng nào.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                              console.log("STATUS BACKEND TRẢ VỀ:", order.status);

                                const statusInfo = getStatusClasses(order.status);
                                return (
                                    <React.Fragment key={order.id}>
                                        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-slate-800">
                                                {order.code}
                                            </td>
                                            <td className="py-3 px-4">
                                                {order.createdAt
                                                    ? new Date(order.createdAt).toLocaleString("vi-VN")
                                                    : "-"}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-800">
                                                {Number(order.totalAmount).toLocaleString("vi-VN")} VND
                                            </td>
                                            <td className="py-3 px-4">
                                                {/* ÁP DỤNG HÀM MỚI */}
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.classes}`}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    className="text-indigo-600 text-xs font-semibold hover:underline"
                                                    onClick={() =>
                                                        setExpanded((prev) => (prev === order.id ? null : order.id))
                                                    }
                                                >
                                                    {expanded === order.id ? "Thu gọn" : "Chi tiết"}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* ... (Phần chi tiết đơn hàng expanded) ... */}
                                        {expanded === order.id && (
                                            <tr className="bg-slate-50">
                                                <td colSpan={5} className="px-4 pb-4">
                                                    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
                                                        <p className="font-semibold text-slate-800 mb-2">Sản phẩm</p>
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
                                                            <p>Địa chỉ giao: {order.shippingAddress || "-"}</p>
                                                            <p>Phương thức: {order.paymentMethod}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
   
  );
}
