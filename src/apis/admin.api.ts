import { httpAdmin } from "./http";
import { User } from "../types/user";
import { Product } from "../types/product";
import { Order } from "../types/order";

export interface AdminStats {
  revenue: number;
  orders: number;
  approvedOrders: number;
  pendingOrders: number;
  products: number;
  customers: number;
  monthly: { month: string; revenue: number }[];
}

export const AdminApi = {
  stats() {
    return httpAdmin.get<AdminStats>("/admin/stats");
  },
  products: {
    list(params?: {
      q?: string;
      status?: string;
      categoryId?: string | number;
      minPrice?: number;
      maxPrice?: number;
    }) {
      return httpAdmin.get<Product[]>("/admin/products", { params });
    },
    create(payload: Partial<Product>) {
      return httpAdmin.post<Product>("/admin/products", payload);
    },
    update(id: string | number, payload: Partial<Product>) {
      return httpAdmin.put<Product>(`/admin/products/${id}`, payload);
    },
    remove(id: string | number) {
      return httpAdmin.delete(`/admin/products/${id}`);
    },
    import(items: Partial<Product>[]) {
      return httpAdmin.post("/admin/products/import", { items });
    },
  },
  orders: {
    list(params?: { status?: string; q?: string }) {
      return httpAdmin.get<Order[]>("/admin/orders", { params });
    },
    detail(id: string | number) {
      return httpAdmin.get<Order>(`/admin/orders/${id}`);
    },
    updateStatus(id: string | number, status: string) {
      return httpAdmin.patch<Order>(`/admin/orders/${id}/status`, { status });
    },
    import(orders: any[]) {
      return httpAdmin.post("/admin/orders/import", { orders });
    },
  },
  customers(params?: { q?: string }) {
    return httpAdmin.get<User[]>("/admin/customers", { params });
  },
  updateUserRole(id: string | number, role: string) {
    return httpAdmin.patch<User>(`/admin/users/${id}/role`, { role });
  },
};

