export type Role = "user" | "admin" | "staff";
export interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  categoryId?: string | number;
  categoryName?: string;
  status?: string;
  stock?: number;
  createdAt?: string;
}
