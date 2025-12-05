import { http } from "./http";
import { Order } from "../types/order";

export const OrderApi = {
  create(payload: {
    items: { productId: string | number; quantity: number }[];
    shipping: { name: string; email: string; phone: string; address: string };
    paymentMethod?: string;
    notes?: string;
  }) {
    return http.post<Order>("/orders", payload);
  },
  myOrders() {
    return http.get<Order[]>("/orders/me");
  },

    createVnPayUrl(amount: number, shopOrderCode: string) { 
        return http.post<{ orderUrl: string; orderCode: string }>("/orders/vnpay_create_url", {
            amount,
            shopOrderCode, // Sử dụng shopOrderCode để Backend tìm đơn hàng
        });
    },
};
