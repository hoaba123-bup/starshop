import { http } from "./http";
import { User, AuthResponse, SignUpData, SignInData } from "../types/user";

export const AuthApi = {
  signIn(data: SignInData) {
    return http.post<AuthResponse>("/auth/login", data);
  },
  signUp(data: SignUpData) {
    return http.post<AuthResponse>("/auth/register", data);
  },
  me() {
    return http.get<User>("/auth/me");
  },
  logout() {
    localStorage.removeItem("token");
  }
};
