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
};
