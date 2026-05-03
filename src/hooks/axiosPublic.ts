import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const axiosPublic = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

axiosPublic.interceptors.request.use(
  (config) => {
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access");
    }
    if (error.response?.status === 500) {
      console.error("Server error:", error.response?.data?.message);
    }
    return Promise.reject(error);
  },
);

export const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export default axiosPublic;
