import axios from "axios";

// INTERNAL_API_URL: サーバーサイド(SSR)専用。NEXT_PUBLIC_ なしのためクライアントバンドルに含まれない。
// NEXT_PUBLIC_API_BASE_URL: クライアント(ブラウザ)用。ビルド時にインライン化されるため、
//   GitHub Actions の env に設定が必要（secrets.NEXT_PUBLIC_API_BASE_URL）。
const api = axios.create({
  baseURL:
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8888",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;