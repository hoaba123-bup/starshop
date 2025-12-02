import { http } from "./http";
import { Category } from "../types/category";

export const CategoryApi = {
  list(params?: { q?: string }) {
    return http.get<Category[]>("/categories", { params });
  },
};
