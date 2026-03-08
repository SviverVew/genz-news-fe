// lib/api.ts
import axios from "axios";

// Axios instance cơ bản, KHÔNG đụng tới localStorage để tránh lỗi Turbopack
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

export default api;
