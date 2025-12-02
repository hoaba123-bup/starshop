import React from "react";
import { OrderEmailItem } from "./OrderConfirmationEmail";

export interface OrderCancellationEmailProps {
  customerName: string;
  orderId: string;
  items: OrderEmailItem[];
  total: number;
  reason?: string | null;
}

export function OrderCancellationEmail({ customerName, orderId, items, total, reason }: OrderCancellationEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6, color: "#0f172a" }}>
      <h2>StarShop - Xác nhận hủy đơn hàng</h2>
      <p>Xin chào {customerName || "customer"},</p>
      <p>Đơn hàng của bạn đã bị hủy. Vui lòng xem lại thông tin chi tiết bên dưới.</p>

      <p>
        <strong>Mã đơn hàng:</strong> {orderId}
      </p>

      {reason && (
        <p>
          <strong>Lý do:</strong> {reason}
        </p>
      )}

      <h3>Chi tiết sản phẩm:</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.name} × {item.quantity} — {item.price.toLocaleString("vi-VN")} ₫
          </li>
        ))}
      </ul>

      <p>
        <strong>Tổng cộng:</strong> {total.toLocaleString("vi-VN")} ₫
      </p>

      <p>Nếu bạn có thắc mắc, vui lòng trả lời email này để được hỗ trợ.</p>
    </div>
  );
}

