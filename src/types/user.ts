export type Role = "user" | "admin" | "staff";
export interface User {
  id: string | number;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  status?: string;
  createdAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInData {
  email: string;
  password: string;
}
