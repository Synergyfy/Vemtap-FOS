import axios from "axios";

const FOS_API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_FOS_API_URL || "http://localhost:3001/api/v1",
});

FOS_API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("fos_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

FOS_API.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      return body.data;
    }
    return body;
  },
  (err) => {
    if (err.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
        localStorage.removeItem("fos_access_token");
        localStorage.removeItem("fos_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default FOS_API;
