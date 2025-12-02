import React from "react";

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  items: OrderEmailItem[];
  total: number;
}

export function OrderConfirmationEmail({ customerName, orderId, items, total }: OrderConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6, color: "#0f172a" }}>
      <h2>StarShop - Xác nhận đơn hàng</h2>
      <p>Xin chào {customerName || "customer"},</p>
      <p>Đơn hàng của bạn đã được tạo thành công!</p>

      <p>
        <strong>Mã đơn hàng:</strong> {orderId}
      </p>

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

      <p>Cảm ơn bạn đã mua hàng tại StarShop.</p>
    </div>
  );
}

