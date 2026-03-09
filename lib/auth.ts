// lib/auth.ts
import api from "./api";

export const login = (data: {
  email: string;
  password: string;
}) => api.post("/auth/login", data);

export const register = (data: {
  email: string;
  password: string;
  name: string;
}) => api.post("/auth/register", data);

export const verifyOtp = (data: {
  email: string;
  otp: string;
}) => api.post("/auth/verify", data);

export const logout = () => api.post("/auth/logout");

export const refreshToken = () => api.post("/auth/refresh");

// Lấy thông tin user hiện tại (cần token trong header)
export const getMe = () => api.get("/users/me");