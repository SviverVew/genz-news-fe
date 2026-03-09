// lib/api.ts
import axios from "axios";

// Axios instance cơ bản, KHÔNG đụng tới localStorage để tránh lỗi Turbopack
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

// Thêm interceptor để tự động thêm token vào header khi có
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
