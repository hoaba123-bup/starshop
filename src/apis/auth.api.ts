import { http } from "./http";
import { User, AuthResponse, SignUpData, SignInData } from "../types/user";
import { USER_SESSION_EXP_KEY, USER_SESSION_NOTICE_FLAG, USER_TOKEN_KEY } from "../constants/auth";

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
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_SESSION_EXP_KEY);
    sessionStorage.removeItem(USER_SESSION_NOTICE_FLAG);
  }
};
