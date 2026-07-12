import axios, { type AxiosError } from "axios";
import Cookies from "js-cookie";
import { TOKEN_COOKIE } from "./constants";
import type { ApiErrorShape } from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_COOKIE);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors and handle expired/invalid sessions in one place.
api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
      return { ...response, data: payload.data };
    }
    return response;
  },
  (error: AxiosError<ApiErrorShape>) => {
    if (error.response?.status === 401) {
      Cookies.remove(TOKEN_COOKIE);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
