import axios from "axios";

// Uses VITE_API_URL when deployed (set in Vercel), falls back to localhost for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the saved JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gv_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
