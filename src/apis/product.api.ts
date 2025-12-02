import { http } from "./http";
import { Product } from "../types/product";

export const ProductApi = {
  list(params?: { q?: string; categoryId?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number }) {
    return http.get<Product[]>("/products", { params });
  },
  detail(id: string | number) {
    return http.get<Product>(`/products/${id}`);
  },
};
